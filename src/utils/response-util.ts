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

// ----- PAGINATED SUCCESS RESPONSE -----
export const handlePaginatedSuccess = (
  res: Response,
  message: string,
  result: { items: unknown[]; pagination: Record<string, number> }
): Response => {
  return res.status(200).json({
    success: true,
    message,
    data: result.items,
    pagination: result.pagination,
  });
};
