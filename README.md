# Arham Fintech Trade Dashboard

A simple full-stack dashboard for viewing saved trades and simulating delayed pulls from a fixed BSE-style exchange fixture. The backend accepts a pull request immediately, then a worker stores the batch in MongoDB and notifies connected dashboards over Server-Sent Events (SSE).

## Screenshots

![Trade dashboard screenshot 1](https://res.cloudinary.com/dtlessn0g/image/upload/v1791872744/Screenshot_2026-10-13_115333_sjzeme.png)

![Trade dashboard screenshot 2](https://res.cloudinary.com/dtlessn0g/image/upload/v1791872739/Screenshot_2026-10-13_115427_losrvg.png)

## Architecture Diagram

![Application architecture diagram](https://res.cloudinary.com/dtlessn0g/image/upload/v1791876129/Screenshot_2026-10-13_125148_e5hym2.png)

## Assignment Features

- 1,000 initial trades in `Backend/data/trades.json`, loaded into MongoDB by the seed script.
- 1,500 separate fixed exchange trades in `Backend/data/mockExchangeTrades.json`; these are pulled in batches and are not seeded initially.
- `GET /getTrades` returns saved MongoDB trades and is the dashboard's read endpoint.
- Pulls accept a batch of 1–500 trades and a delay up to 15 minutes. The request responds immediately.
- Successful pulls are saved to MongoDB and reported to connected dashboards over SSE. The dashboard does not poll.
- Responsive React dashboard with search, symbol filter, pagination, summary cards, and pull status.

## Project Structure

```text
Backend/
|-- app.js
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
|-- public/                  Logo and public assets
|-- src/
|   |-- components/          Dashboard UI components
|   |-- pages/               Dashboard page and responsive styles
|   |-- services/tradesApi.js
|   |-- App.jsx
|   `-- main.jsx
`-- vite.config.js

docs/architecture.md         Structure, diagram, and design notes
```

## Requirements

- Node.js 20.19+ or 22.12+.
- npm.
- A reachable MongoDB database.

## Setup

1. In `Backend`, install dependencies and create `Backend/.env` with your MongoDB URI:

   ```sh
   cd Backend
   npm install
   ```

   ```dotenv
   MONGO_URI=mongodb://127.0.0.1:27017/arham_fintech
   ```

2. Seed the initial data and start the backend:

   ```sh
   npm run seed
   npm start
   ```

   Backend defaults to port `3000`.

3. In a second terminal, start the frontend:

   ```sh
   cd Frontend
   npm install
   npm run dev
   ```

   Open the Vite URL, usually `http://localhost:5173`. The Vite server proxies `/api` and `/getTrades` to the backend.

## API

All routes are served on port `3000`.

### `GET /getTrades`

Returns saved MongoDB trades, newest first, with aggregate summary data. The dashboard uses this endpoint. Query parameters: `page` (default 1), `limit` (default 10, maximum 100), `search` (trade ID, client, or symbol), and `symbol` (exact symbol). If both `page` and `limit` are omitted, all matching trades are returned.

```sh
curl "http://localhost:3000/getTrades?page=1&limit=10"
```

`GET /api/trades` is a compatibility alias for this endpoint.

### `POST /api/trades/pulls`

Queues a pull and responds with HTTP `202` and a job ID without waiting for the selected delay.

```sh
curl -X POST http://localhost:3000/api/trades/pulls `
  -H "Content-Type: application/json" `
  -d '{"batchSize":100,"delayMs":3000}'
```

`batchSize` must be 1–500; `delayMs` must be 0–900000 (15 minutes).

### `GET /api/trades/events`

SSE stream for `connected`, `pull`, and `trades` events. The latest 100 events are buffered in memory for reconnect replay.

### `GET /api/health`

Returns `{ "status": "ok" }` when the backend is available.

## Data Flow

1. Run `npm run seed` to upsert the 1,000 initial records into MongoDB. Re-running the script does not duplicate trade IDs.
2. The dashboard loads persisted trades from `GET /getTrades` and opens an SSE connection.
3. A user submits a pull. The backend queues it and immediately returns a job ID.
4. The worker waits for the selected delay, takes the next unique records from `mockExchangeTrades.json`, and inserts them into MongoDB.
5. The worker sends an SSE event. The dashboard reloads its current results and summary automatically.

T
