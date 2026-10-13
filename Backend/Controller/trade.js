import Trade from "../Schema/tradeschema.js";
import { createPull } from "../lib/pull_worker.js";
import { getLatestEventId, subscribe } from "../lib/pull_events.js";

export const getTrades = async (req, res) => {
  try {
    const paginated = req.query.page !== undefined || req.query.limit !== undefined;
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

    const tradesQuery = Trade.find(filter).sort({ timestamp: -1 });
    if (paginated) tradesQuery.skip((page - 1) * limit).limit(limit);

    const [trades, total, summaryRows] = await Promise.all([
      tradesQuery.lean(),
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
    const responseLimit = paginated ? limit : total;
    res.json({
      trades,
      page,
      limit: responseLimit,
      total,
      totalPages: responseLimit ? Math.ceil(total / responseLimit) : 0,
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

export const tradeEvents = (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  res.write("retry: 1000\n\n");
  const currentEventId = getLatestEventId();
  const headerEventId = req.get("Last-Event-ID");
  const lastEventId = headerEventId === undefined ? currentEventId : Number(headerEventId) || currentEventId;
  res.write(`id: ${currentEventId}\nevent: connected\ndata: ${JSON.stringify({ connected: true })}\n\n`);
  const unsubscribe = subscribe(({ id, type, data }) => {
    res.write(`id: ${id}\nevent: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  }, lastEventId);
  const heartbeat = setInterval(() => {
    if (!res.destroyed) res.write(": keep-alive\n\n");
  }, 20000);
  res.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
};
