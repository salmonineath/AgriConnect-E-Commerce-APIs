"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    if (err && typeof err === "object" && "statusCode" in err) {
        const typedErr = err;
        statusCode = typedErr.statusCode || statusCode;
        message = typedErr.message || message;
    }
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`);
    console.error(err);
    const response = Object.freeze({
        status: statusCode,
        message,
        stack: process.env.NODE_ENV === "development" ? err === null || err === void 0 ? void 0 : err.stack : undefined,
    });
    return res.status(statusCode).json({ response });
};
exports.errorHandler = errorHandler;
