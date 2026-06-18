"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const AppError_1 = require("@/core/exceptions/AppError");
const validate = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            const validatedData = await schema.parseAsync(req[source]);
            Object.defineProperty(req, source, {
                value: validatedData,
                writable: true,
                enumerable: true,
                configurable: true
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const issues = error.issues || [];
                const messages = issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
                next(new AppError_1.BadRequestError(messages || 'Validation failed'));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
