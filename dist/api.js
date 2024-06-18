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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const tonweb_1 = __importDefault(require("tonweb"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const depositAddress = process.env.TON_DEPOSIT_ADDRESS;
// Middleware
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)()); // Enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
// POST endpoint to get deposit address and comment
app.post("/deposit", (req, res) => {
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
app.get("/balance", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const telegramId = Number(req.query.telegramId);
    if (!telegramId) {
        return res.status(400).json({ error: "Telegram ID is required" });
    }
    const balanceNanoTon = yield (0, db_1.getBalance)(telegramId);
    const balanceTon = tonweb_1.default.utils.fromNano(balanceNanoTon === null || balanceNanoTon === void 0 ? void 0 : balanceNanoTon.toString());
    res.json({
        balance: balanceTon,
    });
}));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
