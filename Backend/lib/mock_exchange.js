import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const file = resolve(dirname(fileURLToPath(import.meta.url)), "../data/mockExchangeTrades.json");
const trades = JSON.parse(await readFile(file, "utf8"));
let newTrades = trades;
let nextTrade = 0;

export const getMockTrades = () => trades;

export const prepareMockExchange = (savedTradeIds) => {
  const saved = new Set(savedTradeIds);
  newTrades = trades.filter((trade) => !saved.has(trade.tradeId));
};

export const getNextTrades = (count) => {
  const batch = newTrades.slice(nextTrade, nextTrade + count);
  if (batch.length < count) throw new Error(`Only ${batch.length} mock trades remain`);
  nextTrade += count;
  return batch;
};
