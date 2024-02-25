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
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const endpoints_config_1 = __importDefault(require("./endpoints.config"));
dotenv_1.default.config();
const dbName = "cca";
const DB_URI = endpoints_config_1.default.MONGODB_URI;
console.log(endpoints_config_1.default.MONGODB_URI);
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: dbName,
        });
        console.log("🚨🚨🚨 DATABASE INITIALIZING NYOOOM 🚨🚨🚨");
    }
    catch (err) {
        console.log(err.message);
    }
});
exports.connectDB = connectDB;
module.exports = { connectDB: exports.connectDB };
