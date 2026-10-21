// import { Request, Response } from "express";
// import { ApiErrorType } from "@/types/error-type";

// /**
//  * Centralized error handler for all routes.
//  * Designed for enterprise-level Node.js + TypeScript projects.
//  */
// export const errorHandler = (
//     err: ApiErrorType,
//     req: Request,
//     res: Response,
// ) => {
//     // Default Error values
//     let statusCode = err.statusCode || 500;
//     let message = err.message || "Internal Server Error";

//     // custom error
//     if (err && typeof err === "object" && "statusCode" in err) {
//         const typedErr = err as ApiErrorType;
//         statusCode = typedErr.statusCode || statusCode;
//         message = typedErr.message || message;
//     }

//     // Log error
//     console.error(`[ERROR] ${req.method} ${req.originalUrl}`);
//     console.error(err);

//     // Send error response
//     const response = Object.freeze({
//         status: statusCode,
//         message,
//         stack: process.env.NODE_ENV === "development" ? (err as ApiErrorType)?.stack : undefined,
//     });

//     return res.status(statusCode).json({response});
// };