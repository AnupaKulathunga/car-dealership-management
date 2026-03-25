import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // AppError — use its statusCode
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(env.nodeEnv === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Zod validation error — 400
  if (err instanceof ZodError) {
    const message = err.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    res.status(400).json({
      success: false,
      error: message,
      ...(env.nodeEnv === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Unknown error — 500
  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
}
