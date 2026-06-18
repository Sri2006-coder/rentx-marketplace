import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/core/exceptions/AppError';

import fs from 'fs';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR HANDLER]', err.message, err.stack);
  try { fs.appendFileSync('error.log', new Date().toISOString() + ' ' + err.stack + '\n'); } catch(e) {}
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
};
