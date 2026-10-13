# Arham Fintech Trade Dashboard

A small full-stack trade dashboard for viewing saved trades and simulating delayed pulls from a fixed BSE-style exchange fixture. Pull requests return immediately; a backend worker inserts the selected batch later, and connected dashboards receive the update over Server-Sent Events (SSE).

## Screenshots

![Trade dashboard screenshot 1](https://res.cloudinary.com/dtlessn0g/image/upload/v1791872744/Screenshot_2026-10-13_115333_sjzeme.png)

![Trade dashboard screenshot 2](https://res.cloudinary.com/dtlessn0g/image/upload/v1791872739/Screenshot_2026-10-13_115427_losrvg.png)

## Assessment Requirements and Implemented Features

- `Backend/data/trades.json` contains 1,000 initial trades for MongoDB seeding.
- `Backend/data/mockExchangeTrades.json` contains 1,500 additional fixed trades for mock exchange pulls.
- The dashboard opens with existing MongoDB trades and can search by trade ID, client, or symbol, filter by symbol, and page through results.
- Pull requests support batches of 1-500 trades and a delay of up to 15 minutes. The dashboard remains available while the backend worker waits and inserts the batch.
- Connected dashboards receive pull and trade events through SSE. The frontend does not poll for updates.
- `GET /getTrades` exposes the mock exchange fixture. It returns fixture records; it does not read the seeded MongoDB collection.

## Technology Stack

- Frontend: React, Vite, Tailwind CSS utilities, and custom CSS.
- Backend: Node.js, Express, and Mongoose.
- Database: MongoDB.
- Live updates: browser `EventSource` and server-sent events.

## System Architecture

The frontend reads saved trades through the API and submits a short pull request. An in-process backend worker processes queued jobs in order, waits for the selected delay, inserts the next fixture batch into MongoDB, and publishes events to connected SSE clients. See [the architecture note](docs/architecture.md) for the diagram and detailed flow.

## Project Structure

```text
Backend/
|-- app.js
|-- package.json
|-- Controller/trade.js
|-- Routes/traderoute.js
|-- Schema/tradeschema.js
|-- data/
|   |-- trades.json
|   `-- mockExchangeTrades.json
`-- lib/
    |-- db_connect.js
    |-- mock_exchange.js
    |-- pull_events.js
    |-- pull_worker.js
    `-- seeddata.js
Frontend/
|-- package.json
|-- index.html
|-- vite.config.js
|-- public/
|   |-- favicon.svg
|   |-- icons.svg
|   `-- logo_fintech-.png
`-- src/
    |-- App.jsx
    |-- main.jsx
    |-- index.css
    |-- assets/
    |   |-- hero.png
    |   |-- react.svg
    |   `-- vite.svg
    |-- components/
    |   |-- DashboardHeader.jsx
    |   |-- DashboardHero.jsx
    |   |-- LiveUpdateCard.jsx
    |   |-- PullControls.jsx
    |   |-- PullStatus.jsx
    |   |-- TradeSummary.jsx
    |   `-- TradesTable.jsx
    |-- pages/
    |   |-- TradesDashboard.jsx
    |   |-- TradesDashboard.css
    |   `-- responsive.css
    `-- services/tradesApi.js
docs/
`-- architecture.md
```
## Prerequisites

- Node.js 20.19+ or 22.12+ (required by the installed Vite version).
- npm.
- A reachable MongoDB instance, local or hosted.

## Installation and Setup

1. Install backend dependencies and configure MongoDB:

   ```sh
   cd Backend
   npm install
   ```

   Create `Backend/.env` with your own connection string:

   ```dotenv
   MONGO_URI=mongodb://127.0.0.1:27017/arham_fintech
   ```

2. Seed the initial trades and start the backend:

   ```sh
   npm run seed
   npm start
   ```

   The backend listens on port `3000` by default.

3. In a second terminal, install and start the frontend:

   ```sh
   cd Frontend
   npm install
   npm run dev
   ```

   Open the local URL printed by Vite (normally `http://localhost:5173`). The Vite development server proxies `/api` requests to `http://localhost:3000`.

To run the backend with Node's watch mode during development, use `npm run dev` from `Backend`. To check the frontend, use `npm run lint` and `npm run build` from `Frontend`.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `MONGODB_URI` | Alternative | Accepted if `MONGO_URI` is unset. |
| `PORT` | No | Backend port; defaults to `3000`. The frontend Vite proxy is configured for port `3000`. |

Keep credentials in your local `Backend/.env`; do not commit them.

## API Documentation

All endpoints below are served by the backend on port `3000`.

### `GET /getTrades`

Returns the complete mock exchange fixture in `{ "trades": [...] }` form. It does not paginate or read MongoDB.

```sh
curl http://localhost:3000/getTrades
```

Each trade has `tradeId`, `client`, `symbol`, `quantity`, `price`, and `timestamp` fields.

### `GET /api/trades`

Returns saved MongoDB trades, sorted newest first, with pagination and aggregate summary data. Query parameters: `page` (default `1`), `limit` (default `10`, maximum `100`), `search` (matches trade ID, client, or symbol), and `symbol` (exact symbol filter).

```sh
curl "http://localhost:3000/api/trades?page=1&limit=10"
```

Response shape:

```json
{
  "trades": [
    {
      "tradeId": "MOCK-TRD-000817",
      "client": "Client Theta",
      "symbol": "LT",
      "quantity": 207,
      "price": 3707.71,
      "timestamp": "2026-10-13T09:03:09.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1000,
  "totalPages": 100,
  "summary": {
    "total": 1000,
    "uniqueClients": 10,
    "uniqueSymbols": 10,
    "symbols": ["BHARTIARTL", "HDFCBANK", "ICICIBANK", "INFY", "ITC", "LT", "RELIANCE", "SBIN", "TATAMOTORS", "TCS"],
    "tradeValue": 848453061.94
  }
}
```

This example reflects the checked-in initial seed. Values change as pulled trades are added. Summary values cover all saved trades, while `total` and `trades` reflect the active filters.

### `POST /api/trades/pulls`

Accepts a pull request and returns HTTP `202 Accepted` with a job ID. The request does not wait for the selected delay or MongoDB insert.

```sh
curl -X POST http://localhost:3000/api/trades/pulls \
  -H "Content-Type: application/json" \
  -d '{"batchSize":100,"delayMs":3000}'
```

Example response:

```json
{
  "jobId": "generated-job-id",
  "status": "queued",
  "batchSize": 100,
  "delayMs": 3000
}
```

`batchSize` must be an integer from 1 to 500. `delayMs` must be an integer from 0 to 900000.

### `GET /api/trades/events`

Opens an SSE stream. Events include `connected`, `pull`, and `trades`. `pull` events report `waiting`, `processing`, or `failed`; a successful `trades` event contains the inserted trades and `insertedCount`. The dashboard uses this stream for updates.

### `GET /api/health`

Returns `{ "status": "ok" }` when the HTTP route is available.

## Application Workflow

1. Run `npm run seed` once to upsert the initial 1,000 records into MongoDB. The seed uses trade IDs to avoid inserting duplicates on repeated runs.
2. When the dashboard opens, it requests the current saved trades from `GET /api/trades` and opens an SSE connection.
3. The user submits a pull. `POST /api/trades/pulls` validates it, puts it on the in-memory worker queue, and returns a job ID immediately.
4. The worker processes queued pulls in order, waits for the requested delay, and selects the next records from the separate mock fixture.
5. The worker inserts the selected trades into MongoDB and publishes an SSE event. The dashboard then reloads the visible trade page and summary without a manual refresh.

## Handling the 30-Second HTTP Timeout

The `POST /api/trades/pulls` request only queues work and returns `202`; it does not stay open while the worker waits for up to 15 minutes. The worker continues independently in the backend process. The dashboard's SSE connection is a separate request, with a server heartbeat every 20 seconds to keep an idle stream active on networks that enforce idle timeouts.

## Real-Time Dashboard Updates

The frontend opens `/api/trades/events` with `EventSource`. When the worker publishes inserted trades, the backend sends a `trades` event to connected clients. The frontend handles that event by refreshing the current trade query. It does not use a polling loop, page reload, or cronjob.

## Testing Instructions

1. Start MongoDB, seed the database, then start the backend and frontend using the setup steps above.
2. Open the dashboard. Confirm that the saved trades and summary appear. You can also request `GET /api/trades?page=1&limit=10` directly.
3. Start a pull with a short delay (for example, `delayMs: 3000`) and a small batch. Confirm the API returns a job ID immediately and the existing trades remain visible while the status is waiting.
4. Keep the dashboard open until the delay completes. Confirm the pull reaches completion and new trades appear without refreshing the page. Check that the total increases by the inserted batch size.
5. Optional frontend checks: run `npm run lint` and `npm run build` from `Frontend`.

## Architecture Design Decisions

- The initial seed and mock exchange fixture are separate files and serve separate purposes.
- The pull endpoint acknowledges work quickly, while the worker handles the delay and database insert outside that HTTP request.
- MongoDB remains the source for dashboard reads; the mock fixture supplies only new pull data.
- SSE broadcasts updates to currently connected dashboards without a polling loop.

## Assessment Gaps

- The assessment wording asks `GET /getTrades` to return seeded trade data. In this code it returns the separate 1,500-record exchange fixture, while the 1,000 initial trades are loaded into MongoDB and served by `GET /api/trades`. The endpoint therefore returns 1,500 rather than a few thousand records. If the reviewer expects `GET /getTrades` itself to return the seeded collection, that requirement is not met by the current route.
- The source tree does not include the required video walkthrough; it must be recorded separately.
- The current workspace does not contain Git metadata. To meet the single-repository deliverable, initialize or place this project in the required Git repository before submission.

## Known Limitations

- The job queue and fixture cursor are in memory. Pending jobs and pull status are lost when the backend process restarts; this is a simple single-process demo worker, not a durable production queue.
- The mock fixture has 1,500 records. A pull fails when the requested batch is larger than the remaining fixture records.
- SSE sends events to connected clients but does not persist or replay missed events. A browser reconnects automatically, but if it misses the final event, it may need a page reload to refresh its data.
- The SSE heartbeat helps with idle connection timeouts. A network that enforces a hard 30-second maximum connection lifetime can still disconnect the stream; reconnecting clients do not receive replayed events.

