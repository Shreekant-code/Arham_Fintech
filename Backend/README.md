# Backend

## Run it

1. Set `MONGO_URI` in `Backend/.env`.
2. Run `npm run seed` to add the 1,000 starter trades to MongoDB.
3. Run `npm start` to start the API on port 3000.

## API

- `GET /getTrades` returns the fixed mock BSE dataset.
- `GET /api/trades` returns trades already saved in MongoDB. Use `page` and `limit` to paginate.
- `POST /api/trades/pulls` starts a pull. JSON body: `{ "batchSize": 100, "delayMs": 3000 }`. The delay can be up to 900,000 ms (15 minutes). The request returns a job ID immediately.
- `GET /api/trades/events` sends pull updates to connected dashboards using Server-Sent Events.

## Flow

Dashboard → pull request → background worker waits → mock BSE fixture → MongoDB → SSE update → dashboard

`trades.json` is the initial dataset. `mockExchangeTrades.json` is the separate 1,500-trade exchange fixture. The worker processes pulls in order so each pull receives the next fixture records.
