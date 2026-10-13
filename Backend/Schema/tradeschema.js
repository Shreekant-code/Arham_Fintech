
import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    tradeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    client: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Trade = mongoose.model("Trade", tradeSchema);

export default Trade;
