import Decimal from "decimal.js";
import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";
import TonWeb from "tonweb";
import {
  addBalance,
  addUser,
  checkUser,
  getBalance,
  readLastLt,
  writeLastLt,
} from "./db";
import { getLatestTransactions } from "./ton";
import dotenv from "dotenv";

dotenv.config();

const depositAddress = process.env.TON_DEPOSIT_ADDRESS!;
const botToken = process.env.TELEGRAM_BOT_TOKEN!;
const bot = new TelegramBot(botToken, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const playUrl = `https://twilight2dev.github.io/flutter-web-test`;
  await addUser(chatId);
  bot.sendMessage(chatId, "Welcome back! Play the game", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Play",
            web_app: { url: playUrl },
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  });
});

bot.onText(/\/deposit|Deposit/i, async (msg) => {
  const chatId = msg.chat.id;
  const transferUrl = `ton://transfer/${depositAddress}?amount=0&text=${chatId}`;
  bot.sendMessage(
    chatId,
    `It is very easy to top up your balance here.\nSimply send any amount of TON to this address:\n\n\`${depositAddress}\`\n\nAnd include the following comment: \`${chatId}\``,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Deposit",
              url: transferUrl,
            },
          ],
        ],
      },
      parse_mode: "Markdown",
    }
  );
});

bot.onText(/\/balance|Balance/i, async (msg) => {
  const chatId = msg.chat.id;
  const balanceNanoTon = await getBalance(chatId);
  const balanceTon = TonWeb.utils.fromNano(balanceNanoTon?.toString());
  bot.sendMessage(chatId, `Your balance is ${balanceTon ?? 0} TON.`);
});

const pollTransactions = async () => {
  const resp = await getLatestTransactions(depositAddress);
  const lastLt = await readLastLt();
  console.log(`lastLt: ${lastLt}`);

  if (resp.data.ok) {
    for (const tx of resp.data.result) {
      const lt = parseInt(tx.transaction_id.lt);
      if (lt <= lastLt) continue;

      const value = new Decimal(tx.in_msg.value);
      const comment = tx.in_msg.message;
      if (value.gt(0) && comment && !isNaN(Number(comment))) {
        const userId = Number(comment);
        const isUserExisted = await checkUser(userId);
        if (isUserExisted) {
          await addBalance(userId, value);
          await bot.sendMessage(
            userId,
            `Deposit confirmed!\n*+${TonWeb.utils.fromNano(
              value.toString()
            )} TON*`,
            { parse_mode: "Markdown" }
          );
        }
      }
      await writeLastLt(lt);
    }
  }
};

cron.schedule("*/2 * * * * *", pollTransactions);

console.log("Bot is running...");
