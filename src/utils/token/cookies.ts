import { Response } from "express";

const isProd = process.env.NODE_ENV === "production";

/**
 * cookieOptions is used as base for both tokens.
 *
 * - In production: secure=true and sameSite='none' (for cross-site cookies over HTTPS).
 * - In development: secure=false and sameSite='lax' (works for localhost).
 */
export const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" as const : "lax" as const, // types
  path: "/",
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookies = (res: Response) => {
  // Use same cookieOptions when clearing to ensure browser finds the cookies
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};
