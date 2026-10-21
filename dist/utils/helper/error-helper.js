"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationError = exports.internalServerError = exports.databaseError = exports.notFoundError = exports.forbiddenError = exports.unauthorizedError = exports.badRequestError = void 0;
const throwError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};
const badRequestError = (message = "Bad request") => {
    return throwError(400, message);
};
exports.badRequestError = badRequestError;
const unauthorizedError = (message = "Unauthorized access") => {
    return throwError(401, message);
};
exports.unauthorizedError = unauthorizedError;
const forbiddenError = (message = "Forbidden action") => {
    return throwError(403, message);
};
exports.forbiddenError = forbiddenError;
const notFoundError = (message = "Resource not found") => {
    return throwError(404, message);
};
exports.notFoundError = notFoundError;
const databaseError = (message = "Database operation failed") => {
    return throwError(500, message);
};
exports.databaseError = databaseError;
const internalServerError = (message = "Internal server error") => {
    return throwError(500, message);
};
exports.internalServerError = internalServerError;
const validationError = (message = "Validation failed") => {
    return throwError(422, message);
};
exports.validationError = validationError;
