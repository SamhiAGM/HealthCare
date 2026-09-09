import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({ error: 'Query validation failed', details: errors });
      return;
    }
    Object.assign(req.query, result.data);
    next();
  };
}

export function globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('[ERROR]', err.message);

  if (res.headersSent) return next(err);

  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: formatZodErrors(err) });
    return;
  }

  // Never expose stack traces in production
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}

function formatZodErrors(err: ZodError) {
  return err.issues.map((e) => ({
    field: e.path.map(String).join('.'),
    message: e.message,
  }));
}
