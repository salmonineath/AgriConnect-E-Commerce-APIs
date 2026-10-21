import { Response } from "express";

// ----- ERROR RESPONSE -----
export const handleError = (
  res: Response,
  status: number,
  message: string,
  errors?: unknown
): Response => {
  return res.status(status).json({
    success: false,
    message,
    errors: errors || null,
  });
};

// ----- SUCCESS RESPONSE -----
export const handleSuccess = (
  res: Response,
  status: number,
  message: string,
  data?: unknown
): Response => {
  return res.status(status).json({
    success: true,
    message,
    data: data || null,
  });
};
