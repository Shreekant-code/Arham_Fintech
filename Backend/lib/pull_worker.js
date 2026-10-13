import { randomUUID } from "node:crypto";
import Trade from "../Schema/tradeschema.js";
import { getNextTrades, prepareMockExchange } from "./mock_exchange.js";
import { publish } from "./pull_events.js";

const queue = [];
let running = false;

export const startPullWorker = async () => {
  prepareMockExchange(await Trade.distinct("tradeId"));
};

export const createPull = ({ batchSize, delayMs }) => {
  const job = { id: randomUUID(), batchSize, delayMs };
  queue.push(job);
  void processQueue();
  return { jobId: job.id, status: "queued", batchSize, delayMs };
};

async function processQueue() {
  if (running) return;
  running = true;
  while (queue.length > 0) {
    const job = queue.shift();
    publish("pull", { jobId: job.id, status: "waiting", delayMs: job.delayMs });
    await new Promise((resolve) => setTimeout(resolve, job.delayMs));
    publish("pull", { jobId: job.id, status: "processing" });
    try {
      const trades = getNextTrades(job.batchSize);
      await Trade.insertMany(trades);
      publish("trades", { jobId: job.id, trades, insertedCount: trades.length });
    } catch (error) {
      publish("pull", { jobId: job.id, status: "failed", error: error.message });
    }
  }
  running = false;
}
