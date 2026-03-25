import type { PaginationMeta } from '../types';

export function formatSuccess<T>(data: T, meta?: PaginationMeta) {
  return {
    success: true as const,
    data,
    ...(meta && { meta }),
  };
}

export function formatError(message: string, statusCode: number = 500) {
  return {
    success: false as const,
    error: message,
  };
}
