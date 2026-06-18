"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
async function test() {
    try {
        console.log('Keys:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET?.slice(0, 3) + '...',
        });
        console.log('Pinging...');
        const ping = await cloudinary_1.v2.api.ping();
        console.log('Ping success:', ping);
        console.log('Uploading dummy image...');
        // Base64 1x1 pixel transparent gif
        const dummyImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
        const uploadResult = await cloudinary_1.v2.uploader.upload(dummyImage, {
            folder: 'test_folder',
        });
        console.log('Upload success:', uploadResult.secure_url);
    }
    catch (err) {
        console.error('Cloudinary Error Details:', err);
    }
}
test();
