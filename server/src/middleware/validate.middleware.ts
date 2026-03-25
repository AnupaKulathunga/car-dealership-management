import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(result.error);
      return;
    }

    // Express 5 makes query/params read-only, so store parsed data on req instead
    if (source === 'body') {
      req.body = result.data;
    } else {
      // Attach validated data to a custom property
      (req as any).validated = (req as any).validated || {};
      (req as any).validated[source] = result.data;
    }
    next();
  };
}
