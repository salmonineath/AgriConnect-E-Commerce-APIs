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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutController = exports.refreshTokenController = exports.loginController = exports.registerController = void 0;
const auth_service_1 = require("@/services/auth-service");
const controller_error_handler_1 = require("@/utils/helper/controller-error-handler");
const cookies_1 = require("@/utils/token/cookies");
const registerController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, roles } = yield (0, auth_service_1.registerService)(req.body);
        const tokens = user.tokens;
        if (tokens) {
            (0, cookies_1.setAuthCookies)(res, tokens.accessToken, tokens.refreshToken);
        }
        res.status(201).json({
            message: "User registered successfully.",
            user,
            roles
        });
    }
    catch (err) {
        (0, controller_error_handler_1.handleControllerError)(res, err);
    }
});
exports.registerController = registerController;
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, tokens, roles } = yield (0, auth_service_1.loginService)(req.body);
        (0, cookies_1.setAuthCookies)(res, tokens.accessToken, tokens.refreshToken);
        res.status(200).json({
            message: "Login successful.",
            accessToken: tokens.accessToken,
            user,
            roles,
        });
    }
    catch (err) {
        (0, controller_error_handler_1.handleControllerError)(res, err);
    }
});
exports.loginController = loginController;
const refreshTokenController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken;
        const tokens = yield (0, auth_service_1.refreshTokenService)(refreshToken);
        (0, cookies_1.setAuthCookies)(res, tokens.accessToken, tokens.refreshToken);
        res.status(200).json({
            message: "Access token refreshed.",
            accessToken: tokens.accessToken,
        });
    }
    catch (err) {
        (0, controller_error_handler_1.handleControllerError)(res, err);
    }
});
exports.refreshTokenController = refreshTokenController;
const logoutController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, auth_service_1.logoutService)(req, res);
    return result;
});
exports.logoutController = logoutController;
