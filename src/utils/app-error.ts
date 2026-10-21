export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: number;

  constructor(message: string, statusCode = 500, code?: number) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
