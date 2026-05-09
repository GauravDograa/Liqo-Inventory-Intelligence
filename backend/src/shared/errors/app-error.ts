export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly code = "INTERNAL_SERVER_ERROR",
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;
