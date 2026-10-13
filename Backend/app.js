import "dotenv/config";
import express from "express";
import connectDB from "./lib/db_connect.js";
import tradeRoutes from "./Routes/traderoute.js";
import { startPullWorker } from "./lib/pull_worker.js";
import { getMockBseTrades } from "./Controller/trade.js";

const app = express();

app.use(express.json());
app.use("/api/trades", tradeRoutes);
app.get("/getTrades", getMockBseTrades);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const start = async () => {
  await connectDB();
  await startPullWorker();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Server is running on port ${port}`));
};

start().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exitCode = 1;
});
