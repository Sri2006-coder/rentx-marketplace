"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtil = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class PasswordUtil {
    static saltRounds = 10;
    static async hash(password) {
        return bcrypt_1.default.hash(password, this.saltRounds);
    }
    static async compare(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
}
exports.PasswordUtil = PasswordUtil;
