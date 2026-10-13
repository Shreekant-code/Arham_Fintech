import Trade from "../Schema/tradeschema.js";
import { getMockTrades } from "../lib/mock_exchange.js";
import { createPull } from "../lib/pull_worker.js";
import { subscribe } from "../lib/pull_events.js";

export const getTrades = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const search = String(req.query.search || "").trim();
    const symbol = String(req.query.symbol || "").trim().toUpperCase();
    const filter = {};
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["tradeId", "client", "symbol"].map((field) => ({ [field]: new RegExp(escaped, "i") }));
    }
    if (symbol) filter.symbol = symbol;

    const [trades, total, summaryRows] = await Promise.all([
      Trade.find(filter).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Trade.countDocuments(filter),
      Trade.aggregate([{ $group: {
        _id: null,
        total: { $sum: 1 },
        clients: { $addToSet: "$client" },
        symbols: { $addToSet: "$symbol" },
        tradeValue: { $sum: { $multiply: ["$quantity", "$price"] } },
      } }]),
    ]);
    const summary = summaryRows[0] || { total: 0, clients: [], symbols: [], tradeValue: 0 };
    res.json({
      trades,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      summary: {
        total: summary.total,
        uniqueClients: summary.clients.length,
        uniqueSymbols: summary.symbols.length,
        symbols: summary.symbols.sort(),
        tradeValue: summary.tradeValue,
      },
    });
  } catch {
    res.status(500).json({ message: "Could not load trades" });
  }
};

export const getMockBseTrades = (_req, res) => {
  res.json({ trades: getMockTrades() });
};

export const createTradePull = (req, res) => {
  const batchSize = Number(req.body.batchSize ?? 100);
  const delayMs = Number(req.body.delayMs ?? 3000);
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 500) {
    return res.status(400).json({ message: "batchSize must be between 1 and 500" });
  }
  if (!Number.isInteger(delayMs) || delayMs < 0 || delayMs > 900000) {
    return res.status(400).json({ message: "delayMs must be between 0 and 900000" });
  }
  res.status(202).json(createPull({ batchSize, delayMs }));
};

export const tradeEvents = (_req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  res.write(`event: connected\ndata: ${JSON.stringify({ connected: true })}\n\n`);
  const unsubscribe = subscribe(({ type, data }) => {
    res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  });
  const heartbeat = setInterval(() => res.write(": keep-alive\n\n"), 20000);
  res.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
};
