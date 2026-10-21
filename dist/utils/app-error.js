"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.AppError = AppError;
