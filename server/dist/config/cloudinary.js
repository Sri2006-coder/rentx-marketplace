"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCloudinaryConnection = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const verifyCloudinaryConnection = async () => {
    try {
        const res = await cloudinary_1.v2.api.ping();
        console.log('✅ Cloudinary connected successfully:', res);
        return true;
    }
    catch (error) {
        console.error('❌ Cloudinary connection failed:', error);
        return false;
    }
};
exports.verifyCloudinaryConnection = verifyCloudinaryConnection;
exports.default = cloudinary_1.v2;
