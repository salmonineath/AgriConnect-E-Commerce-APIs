"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSuccess = exports.handleError = void 0;
const handleError = (res, status, message, errors) => {
    return res.status(status).json({
        success: false,
        message,
        errors: errors || null,
    });
};
exports.handleError = handleError;
const handleSuccess = (res, status, message, data) => {
    return res.status(status).json({
        success: true,
        message,
        data: data || null,
    });
};
exports.handleSuccess = handleSuccess;
