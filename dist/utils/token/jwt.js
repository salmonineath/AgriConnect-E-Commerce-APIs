"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("JWT secrets are not defined in environment variables");
}
const generateTokens = (payload) => {
    const accessTokenOptions = {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES || "15m"),
    };
    const refreshTokenOptions = {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES || "7d"),
    };
    const accessToken = jsonwebtoken_1.default.sign({
        _id: payload._id,
        email: payload.email,
        roles: payload.roles,
    }, ACCESS_TOKEN_SECRET, accessTokenOptions);
    const refreshToken = jsonwebtoken_1.default.sign({
        _id: payload._id,
        email: payload.email,
        roles: payload.roles,
    }, REFRESH_TOKEN_SECRET, refreshTokenOptions);
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
