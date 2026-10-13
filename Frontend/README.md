# Frontend

React dashboard built with Vite and Tailwind CSS, with dashboard-specific responsive styles.

## Run

```sh
npm install
npm run dev
```

The Vite development server proxies `/getTrades` and `/api` requests to `http://localhost:3000`. Start the backend and MongoDB first. See the root [README](../README.md) for complete setup and the [architecture note](../docs/architecture.md) for the data flow.

## Main folders

- `src/pages/`: dashboard page and page styles.
- `src/components/`: header, hero, summary, trades table, pull controls/status, and live connection card.
- `src/services/tradesApi.js`: trade reads, pull creation, and SSE subscription.
- `public/`: logo and static assets.
