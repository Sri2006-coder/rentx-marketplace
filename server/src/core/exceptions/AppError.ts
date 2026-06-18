export class AppError extends Error {
  constructor(public statusCode: number, public message: string, public isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
     super(403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
     super(409, message);
  }
}
