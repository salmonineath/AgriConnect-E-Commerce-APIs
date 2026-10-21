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
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("@/config/env");
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const MONGODB_URI = env_1.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        const conn = yield mongoose_1.default.connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error("Error connecting to the database:", error);
    }
});
exports.default = connectDB;
