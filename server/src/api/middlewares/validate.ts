import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../../core/exceptions/AppError';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req[source]);
      Object.defineProperty(req, source, {
        value: validatedData,
        writable: true,
        enumerable: true,
        configurable: true
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || [];
        const messages = issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
        next(new BadRequestError(messages || 'Validation failed'));
      } else {
        next(error);
      }
    }
  };
};
