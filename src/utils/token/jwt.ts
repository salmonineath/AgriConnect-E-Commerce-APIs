import jwt, { SignOptions } from "jsonwebtoken";
import { tokenPaylodExtends } from "@/types/auth-type";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("JWT secrets are not defined in environment variables");
}

export const generateTokens = (payload: tokenPaylodExtends): { accessToken: string; refreshToken: string } => {
    const accessTokenOptions: SignOptions = {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES || "15m") as SignOptions["expiresIn"],
    };

    const refreshTokenOptions: SignOptions = {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES || "7d") as SignOptions["expiresIn"],
    };

    const accessToken = jwt.sign(
        {
            _id: payload._id,
            email: payload.email,
            roles: payload.roles,
        },
        ACCESS_TOKEN_SECRET,
        accessTokenOptions
    );

    const refreshToken = jwt.sign(
        {
            _id: payload._id,
            email: payload.email,
            roles: payload.roles,
        },
        REFRESH_TOKEN_SECRET,
        refreshTokenOptions
    );

    return { accessToken, refreshToken };
}
