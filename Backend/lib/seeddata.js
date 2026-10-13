import "dotenv/config";
import mongoose from "mongoose";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import connectDB from "./db_connect.js";
import Trade from "../Schema/tradeschema.js";

const dataFile = resolve(dirname(fileURLToPath(import.meta.url)), "../data/trades.json");

const seedTrades = async () => {
  try {
    await connectDB();

    const fileContent = await readFile(dataFile, "utf-8");

    const tradeData = JSON.parse(fileContent);

    if (!Array.isArray(tradeData)) {
      throw new Error("Expected an array of trades.");
    }

    const result = await Trade.bulkWrite(
      tradeData.map((trade) => ({
        updateOne: {
          filter: { tradeId: trade.tradeId },
          update: {
            $setOnInsert: {
              ...trade,
              timestamp: new Date(trade.timestamp),
            },
          },
          upsert: true,
        },
      }))
    );

    console.log("Seeding completed.");
    console.log(`Inserted: ${result.upsertedCount}`);
    console.log(
      `Total trades: ${await Trade.countDocuments()}`
    );
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedTrades();
