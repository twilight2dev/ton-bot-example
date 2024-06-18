"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const decimal_js_1 = __importDefault(require("decimal.js"));
const node_cron_1 = __importDefault(require("node-cron"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const tonweb_1 = __importDefault(require("tonweb"));
const db_1 = require("./db");
const ton_1 = require("./ton");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const depositAddress = process.env.TON_DEPOSIT_ADDRESS;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new node_telegram_bot_api_1.default(botToken, { polling: true });
bot.onText(/\/start/, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const playUrl = `https://twilight2dev.github.io/flutter-web-test`;
    yield (0, db_1.addUser)(chatId);
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
}));
bot.onText(/\/deposit|Deposit/i, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const transferUrl = `ton://transfer/${depositAddress}?amount=0&text=${chatId}`;
    bot.sendMessage(chatId, `It is very easy to top up your balance here.\nSimply send any amount of TON to this address:\n\n\`${depositAddress}\`\n\nAnd include the following comment: \`${chatId}\``, {
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
    });
}));
bot.onText(/\/balance|Balance/i, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const balanceNanoTon = yield (0, db_1.getBalance)(chatId);
    const balanceTon = tonweb_1.default.utils.fromNano(balanceNanoTon === null || balanceNanoTon === void 0 ? void 0 : balanceNanoTon.toString());
    bot.sendMessage(chatId, `Your balance is ${balanceTon !== null && balanceTon !== void 0 ? balanceTon : 0} TON.`);
}));
const pollTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield (0, ton_1.getLatestTransactions)(depositAddress);
    const lastLt = yield (0, db_1.readLastLt)();
    console.log(`lastLt: ${lastLt}`);
    if (resp.data.ok) {
        for (const tx of resp.data.result) {
            const lt = parseInt(tx.transaction_id.lt);
            if (lt <= lastLt)
                continue;
            const value = new decimal_js_1.default(tx.in_msg.value);
            const comment = tx.in_msg.message;
            if (value.gt(0) && comment && !isNaN(Number(comment))) {
                const userId = Number(comment);
                const isUserExisted = yield (0, db_1.checkUser)(userId);
                if (isUserExisted) {
                    yield (0, db_1.addBalance)(userId, value);
                    yield bot.sendMessage(userId, `Deposit confirmed!\n*+${tonweb_1.default.utils.fromNano(value.toString())} TON*`, { parse_mode: "Markdown" });
                }
            }
            yield (0, db_1.writeLastLt)(lt);
        }
    }
});
node_cron_1.default.schedule("*/2 * * * * *", pollTransactions);
console.log("Bot is running...");
