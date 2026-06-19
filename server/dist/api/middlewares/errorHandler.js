"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../../core/exceptions/AppError");
const fs_1 = __importDefault(require("fs"));
const errorHandler = (err, req, res, next) => {
    console.error('[ERROR HANDLER]', err.message, err.stack);
    try {
        fs_1.default.appendFileSync('error.log', new Date().toISOString() + ' ' + err.stack + '\n');
    }
    catch (e) { }
    if (err instanceof AppError_1.AppError) {
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
exports.errorHandler = errorHandler;
