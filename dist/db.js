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
exports.writeLastLt = exports.readLastLt = exports.getBalance = exports.addBalance = exports.checkUser = exports.addUser = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
exports.default = prisma;
function addUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const isExisted = yield checkUser(userId);
        if (!isExisted) {
            yield prisma.user.create({
                data: { telegramId: userId },
            });
        }
    });
}
exports.addUser = addUser;
function checkUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const existedUser = yield prisma.user.findUnique({
            where: { telegramId: userId },
        });
        return existedUser != null;
    });
}
exports.checkUser = checkUser;
function addBalance(userId, value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.user.update({
            where: { telegramId: userId },
            data: { balance: { increment: value } },
        });
    });
}
exports.addBalance = addBalance;
function getBalance(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const existedUser = yield prisma.user.findUnique({
            where: { telegramId: userId },
        });
        return existedUser === null || existedUser === void 0 ? void 0 : existedUser.balance;
    });
}
exports.getBalance = getBalance;
function readLastLt() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = fs_1.default.readFileSync("last_lt.txt", "utf-8");
            return parseInt(data, 10);
        }
        catch (error) {
            return 0;
        }
    });
}
exports.readLastLt = readLastLt;
function writeLastLt(lt) {
    return __awaiter(this, void 0, void 0, function* () {
        fs_1.default.writeFileSync("last_lt.txt", lt.toString(), "utf-8");
    });
}
exports.writeLastLt = writeLastLt;
