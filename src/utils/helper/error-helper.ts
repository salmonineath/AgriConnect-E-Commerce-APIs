import { ApiErrorType } from "@/types/error-type";

const throwError = (statusCode: number, message: string): ApiErrorType => {
    const error = new Error(message) as ApiErrorType;
    error.statusCode = statusCode;
    return error;
};

export const badRequestError = (message = "Bad request") => {
    return throwError(400, message);
};

export const unauthorizedError = (message = "Unauthorized access") => {
    return throwError(401, message);
};  

export const forbiddenError = (message = "Forbidden action") => {
    return throwError(403, message);
};

export const notFoundError = (message = "Resource not found") => {
    return throwError(404, message);
};

export const databaseError = (message = "Database operation failed") => {
    return throwError(500, message);
};
export const internalServerError = (message = "Internal server error") => {
    return throwError(500, message);
};
export const validationError = (message = "Validation failed") => {
    return throwError(422, message);
};
