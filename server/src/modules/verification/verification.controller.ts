import { Request, Response, NextFunction } from 'express';
import { VerificationService } from './verification.service';
import cloudinary from '../../config/cloudinary';
import { BadRequestError } from '../../core/exceptions/AppError';
import fs from 'fs';
import path from 'path';

export class VerificationController {
  static async uploadDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || !files.aadhaar || !files.pan) {
        throw new BadRequestError('Both Aadhaar and PAN documents are required');
      }

      const aadhaarFile = files.aadhaar[0];
      const panFile = files.pan[0];

      const uploadToCloudinary = async (fileBuffer: Buffer, mimetype: string, folder: string): Promise<string> => {
        try {
          const b64 = fileBuffer.toString('base64');
          const dataURI = `data:${mimetype};base64,${b64}`;
          const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
          });
          return result.secure_url;
        } catch (error: any) {
          console.error('Cloudinary Error:', error);
          console.warn('Falling back to local disk storage due to Cloudinary failure (necessary for development).');
          
          // Fallback to local storage
          const uploadDir = path.join(process.cwd(), 'public/uploads', 'kyc');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          
          const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`; // defaulting to png for fallback
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, fileBuffer);
          
          return `http://localhost:5000/uploads/kyc/${filename}`;
        }
      };

      // Upload both concurrently
      const [aadhaarUrl, panUrl] = await Promise.all([
        uploadToCloudinary(aadhaarFile.buffer, aadhaarFile.mimetype, 'aadhaar'),
        uploadToCloudinary(panFile.buffer, panFile.mimetype, 'pan')
      ]);

      const result = await VerificationService.uploadDocuments(userId, aadhaarUrl, panUrl);
      
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async autoVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { score, ocrText } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || !files.aadhaar || !files.selfie) {
        throw new BadRequestError('Both Aadhaar and Selfie images are required for auto-verification');
      }

      if (!score || isNaN(Number(score))) {
        throw new BadRequestError('Valid face match score is required');
      }

      const matchScore = Number(score);

      const aadhaarFile = files.aadhaar[0];
      const selfieFile = files.selfie[0];

      const uploadToCloudinary = async (fileBuffer: Buffer, mimetype: string, folder: string): Promise<string> => {
        try {
          const b64 = fileBuffer.toString('base64');
          const dataURI = `data:${mimetype};base64,${b64}`;
          const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
          });
          return result.secure_url;
        } catch (error: any) {
          console.warn('Falling back to local disk storage for auto-verify.');
          const uploadDir = path.join(process.cwd(), 'public/uploads', 'kyc');
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
          fs.writeFileSync(path.join(uploadDir, filename), fileBuffer);
          return `http://localhost:5000/uploads/kyc/${filename}`;
        }
      };

      const [aadhaarUrl, selfieUrl] = await Promise.all([
        uploadToCloudinary(aadhaarFile.buffer, aadhaarFile.mimetype, 'aadhaar-auto'),
        uploadToCloudinary(selfieFile.buffer, selfieFile.mimetype, 'selfie-auto')
      ]);

      const result = await VerificationService.autoVerifyUser(userId, aadhaarUrl, selfieUrl, matchScore, ocrText || '');
      
      res.status(200).json({ success: true, data: result, message: 'Auto-verification successful' });
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await VerificationService.getStatus(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async approveVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // userId to approve
      const result = await VerificationService.approveVerification(id as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async rejectVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // userId to reject
      const result = await VerificationService.rejectVerification(id as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getUserTrustScore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await VerificationService.getStatus(id as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
