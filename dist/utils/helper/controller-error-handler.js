"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleControllerError = void 0;
const app_error_1 = require("@/utils/app-error");
const mongoose_1 = __importDefault(require("mongoose"));
const handleControllerError = (res, error) => {
    if (error instanceof app_error_1.AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }
    if (error instanceof mongoose_1.default.Error.ValidationError) {
        const messages = Object.values(error.errors).map((err) => (err).message);
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: messages,
        });
    }
    if (error.code === 11000) {
        const fields = Object.keys(error.keyValue);
        return res.status(409).json({
            success: false,
            message: `Duplicate field value: ${fields.join(", ")}`,
            duplicateFields: error.keyValue,
        });
    }
    if (error instanceof mongoose_1.default.Error.CastError) {
        return res.status(400).json({
            success: false,
            message: `Invalid ${error.path}: ${error.value}`,
        });
    }
    if (error instanceof Error) {
        console.error("RUNTIME ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};
exports.handleControllerError = handleControllerError;
