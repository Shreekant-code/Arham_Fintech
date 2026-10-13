# Backend

## Run

1. Install dependencies: `npm install`.
2. Create `Backend/.env` with `MONGO_URI` for your MongoDB database.
3. Seed initial data: `npm run seed`.
4. Start API and worker: `npm start` (port 3000 by default).

## Files

- `app.js`: Express setup, database connection, and API routes.
- `Controller/trade.js`: saved trade reads, pull validation, and SSE endpoint.
- `Routes/traderoute.js`: `/api/trades` route group.
- `Schema/tradeschema.js`: MongoDB trade schema.
- `data/trades.json`: 1,000 initial trades loaded by the seed script.
- `data/mockExchangeTrades.json`: separate 1,500-record fixture used for pulls.
- `lib/seeddata.js`: inserts initial records by unique trade ID.
- `lib/mock_exchange.js`: chooses the next unused fixture batch.
- `lib/pull_worker.js`: waits and stores queued pull batches.
- `lib/pull_events.js`: broadcasts events and retains the latest 100 for reconnect replay.

## Routes

- `GET /getTrades`: reads saved MongoDB trades; accepts `page`, `limit`, `search`, and `symbol`. Omitting page and limit returns all matching records.
- `GET /api/trades`: compatibility alias for `GET /getTrades`.
- `POST /api/trades/pulls`: accepts `{ "batchSize": 100, "delayMs": 3000 }`; delay is limited to 15 minutes and the route responds immediately.
- `GET /api/trades/events`: SSE updates for pull progress and inserted trades.
- `GET /api/health`: basic health response.

The seed dataset and mock pull fixture stay separate. For setup, full architecture, and known limits, see the root [README](../README.md) and [architecture note](../docs/architecture.md).
