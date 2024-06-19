import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { getBalance } from "./db";
import TonWeb from "tonweb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const depositAddress = process.env.TON_DEPOSIT_ADDRESS!;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

app.post("/deposit", (req: any, res: any) => {
  console.log("CALL DEPOSIT");
  const { telegramId } = req.body;

  if (!telegramId) {
    return res.status(400).json({ error: "Telegram ID is required" });
  }

  res.json({
    address: depositAddress,
    comment: telegramId,
  });
});

app.get("/balance", async (req: any, res: any) => {
  const telegramId = Number(req.query.telegramId);

  if (!telegramId) {
    return res.status(400).json({ error: "Telegram ID is required" });
  }

  const balanceNanoTon = await getBalance(telegramId);
  const balanceTon = TonWeb.utils.fromNano(balanceNanoTon?.toString() ?? 0);
  res.json({
    balance: balanceTon,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
