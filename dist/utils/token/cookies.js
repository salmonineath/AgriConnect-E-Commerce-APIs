"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = exports.cookieOptions = void 0;
const isProd = process.env.NODE_ENV === "production";
exports.cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
};
const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, Object.assign(Object.assign({}, exports.cookieOptions), { maxAge: 15 * 60 * 1000 }));
    res.cookie("refreshToken", refreshToken, Object.assign(Object.assign({}, exports.cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 }));
};
exports.setAuthCookies = setAuthCookies;
const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", exports.cookieOptions);
    res.clearCookie("refreshToken", exports.cookieOptions);
};
exports.clearAuthCookies = clearAuthCookies;
