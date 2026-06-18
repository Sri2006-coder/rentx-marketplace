"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationController = void 0;
const verification_service_1 = require("./verification.service");
const cloudinary_1 = __importDefault(require("@/config/cloudinary"));
const AppError_1 = require("@/core/exceptions/AppError");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class VerificationController {
    static async uploadDocuments(req, res, next) {
        try {
            const userId = req.user.id;
            const files = req.files;
            if (!files || !files.aadhaar || !files.pan) {
                throw new AppError_1.BadRequestError('Both Aadhaar and PAN documents are required');
            }
            const aadhaarFile = files.aadhaar[0];
            const panFile = files.pan[0];
            const uploadToCloudinary = async (fileBuffer, mimetype, folder) => {
                try {
                    const b64 = fileBuffer.toString('base64');
                    const dataURI = `data:${mimetype};base64,${b64}`;
                    const result = await cloudinary_1.default.uploader.upload(dataURI, {
                        resource_type: 'auto',
                    });
                    return result.secure_url;
                }
                catch (error) {
                    console.error('Cloudinary Error:', error);
                    console.warn('Falling back to local disk storage due to Cloudinary failure (necessary for development).');
                    // Fallback to local storage
                    const uploadDir = path_1.default.join(process.cwd(), 'public/uploads', 'kyc');
                    if (!fs_1.default.existsSync(uploadDir)) {
                        fs_1.default.mkdirSync(uploadDir, { recursive: true });
                    }
                    const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`; // defaulting to png for fallback
                    const filePath = path_1.default.join(uploadDir, filename);
                    fs_1.default.writeFileSync(filePath, fileBuffer);
                    return `http://localhost:5000/uploads/kyc/${filename}`;
                }
            };
            // Upload both concurrently
            const [aadhaarUrl, panUrl] = await Promise.all([
                uploadToCloudinary(aadhaarFile.buffer, aadhaarFile.mimetype, 'aadhaar'),
                uploadToCloudinary(panFile.buffer, panFile.mimetype, 'pan')
            ]);
            const result = await verification_service_1.VerificationService.uploadDocuments(userId, aadhaarUrl, panUrl);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async autoVerify(req, res, next) {
        try {
            const userId = req.user.id;
            const { score, ocrText } = req.body;
            const files = req.files;
            if (!files || !files.aadhaar || !files.selfie) {
                throw new AppError_1.BadRequestError('Both Aadhaar and Selfie images are required for auto-verification');
            }
            if (!score || isNaN(Number(score))) {
                throw new AppError_1.BadRequestError('Valid face match score is required');
            }
            const matchScore = Number(score);
            const aadhaarFile = files.aadhaar[0];
            const selfieFile = files.selfie[0];
            const uploadToCloudinary = async (fileBuffer, mimetype, folder) => {
                try {
                    const b64 = fileBuffer.toString('base64');
                    const dataURI = `data:${mimetype};base64,${b64}`;
                    const result = await cloudinary_1.default.uploader.upload(dataURI, {
                        resource_type: 'auto',
                    });
                    return result.secure_url;
                }
                catch (error) {
                    console.warn('Falling back to local disk storage for auto-verify.');
                    const uploadDir = path_1.default.join(process.cwd(), 'public/uploads', 'kyc');
                    if (!fs_1.default.existsSync(uploadDir))
                        fs_1.default.mkdirSync(uploadDir, { recursive: true });
                    const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
                    fs_1.default.writeFileSync(path_1.default.join(uploadDir, filename), fileBuffer);
                    return `http://localhost:5000/uploads/kyc/${filename}`;
                }
            };
            const [aadhaarUrl, selfieUrl] = await Promise.all([
                uploadToCloudinary(aadhaarFile.buffer, aadhaarFile.mimetype, 'aadhaar-auto'),
                uploadToCloudinary(selfieFile.buffer, selfieFile.mimetype, 'selfie-auto')
            ]);
            const result = await verification_service_1.VerificationService.autoVerifyUser(userId, aadhaarUrl, selfieUrl, matchScore, ocrText || '');
            res.status(200).json({ success: true, data: result, message: 'Auto-verification successful' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getStatus(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await verification_service_1.VerificationService.getStatus(userId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async approveVerification(req, res, next) {
        try {
            const { id } = req.params; // userId to approve
            const result = await verification_service_1.VerificationService.approveVerification(id);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async rejectVerification(req, res, next) {
        try {
            const { id } = req.params; // userId to reject
            const result = await verification_service_1.VerificationService.rejectVerification(id);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserTrustScore(req, res, next) {
        try {
            const { id } = req.params;
            const result = await verification_service_1.VerificationService.getStatus(id);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.VerificationController = VerificationController;
