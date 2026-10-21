import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI || "",
    JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
    NODE_ENV: process.env.NODE_ENV || "development",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret",
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "your_access_token_secret",
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
}