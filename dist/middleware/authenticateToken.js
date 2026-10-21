"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_util_1 = require("@/utils/response-util");
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
            return (0, response_util_1.handleError)(res, 401, "Unauthorized");
        }
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
            return (0, response_util_1.handleError)(res, 401, "Unauthorized");
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded._id) || !(decoded === null || decoded === void 0 ? void 0 : decoded.email) || !(decoded === null || decoded === void 0 ? void 0 : decoded.roles)) {
            return (0, response_util_1.handleError)(res, 400, "Invalid token");
        }
        req.user = {
            _id: decoded._id,
            email: decoded.email,
            roles: decoded.roles || []
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return (0, response_util_1.handleError)(res, 401, "Access token expired.");
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return (0, response_util_1.handleError)(res, 401, "Invalid token.");
        }
        return (0, response_util_1.handleError)(res, 500, "Unexpected error.");
    }
};
exports.authenticateToken = authenticateToken;
