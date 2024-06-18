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
exports.getLatestTransactions = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const tonweb_1 = __importDefault(require("tonweb"));
dotenv_1.default.config();
const apiBaseUrl = process.env.TON_API_BASE_URL;
const apiKey = process.env.TON_API_KEY;
const tonweb = new tonweb_1.default(new tonweb_1.default.HttpProvider(apiBaseUrl, { apiKey: apiKey }));
// export async function getBalance(address: string): Promise<string> {
//   const response = await axios.get(`${apiBaseUrl}/getAddressBalance`, {
//     params: {
//       address,
//       api_key: apiKey,
//     },
//   });
//   console.log(response);
//   const nanoTon = response.data.result;
//   return TonWeb.utils.fromNano(nanoTon);
// }
function getLatestTransactions(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(`${apiBaseUrl}/getTransactions`, {
            params: {
                address,
                limit: 100,
                archival: true,
                api_key: apiKey,
            },
        });
        return response;
    });
}
exports.getLatestTransactions = getLatestTransactions;
