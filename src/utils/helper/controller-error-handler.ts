import { Response } from "express";
import { AppError } from "@/utils/app-error";
import mongoose from "mongoose";

/**
 * Advanced centralized controller error handler.
 * Catches AppError, Mongoose errors, validation, cast, duplicate keys, and unexpected errors.
 */
export const handleControllerError = (res: Response, error: unknown) => {
  // Custom application errors (your AppError)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Mongoose validation errors
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((err) => (err).message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  // Mongoose duplicate key error (e.g., unique index conflict)
  if ((error as any).code === 11000) {
    const fields = Object.keys((error as any).keyValue);
    return res.status(409).json({
      success: false,
      message: `Duplicate field value: ${fields.join(", ")}`,
      duplicateFields: (error as any).keyValue,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${error.path}: ${error.value}`,
    });
  }

  // TypeError, ReferenceError, or other runtime JS errors
  if (error instanceof Error) {
    console.error("RUNTIME ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};