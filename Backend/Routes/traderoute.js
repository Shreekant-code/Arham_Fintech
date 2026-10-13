import { Router } from "express";
import { createTradePull, getTrades, tradeEvents } from "../Controller/trade.js";

const router = Router();

router.get("/events", tradeEvents);
router.get("/", getTrades);
router.post("/pulls", createTradePull);

export default router;
