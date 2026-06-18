import { ItemRepository } from './item.repository';
import { CreateItemInput, ItemQueryInput, UpdateItemInput } from './item.schema';
import { NotFoundError, ForbiddenError } from '@/core/exceptions/AppError';

import cloudinary from '@/config/cloudinary';
import fs from 'fs';
import path from 'path';

export class ItemService {
  static async uploadToCloudinary(fileBuffer: Buffer, mimetype: string, folder: string): Promise<string> {
    try {
      const b64 = fileBuffer.toString('base64');
      const dataURI = `data:${mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'auto',
      });
      return result.secure_url;
    } catch (error: any) {
      console.warn('Cloudinary upload failed, falling back to local disk storage.');
      const uploadDir = path.join(process.cwd(), 'public/uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, fileBuffer);
      
      return `http://localhost:5000/uploads/${folder}/${filename}`;
    }
  }

  static async createItem(ownerId: string, data: CreateItemInput, files: Express.Multer.File[]) {
    // Upload all files concurrently
    const imageUrlPromises = files.map(file => this.uploadToCloudinary(file.buffer, file.mimetype, 'items'));
    const imageUrls = await Promise.all(imageUrlPromises);
    
    return await ItemRepository.createItem(ownerId, data, imageUrls);
  }

  static async getItems(query: ItemQueryInput) {
    const result = await ItemRepository.getItems(query);
    const items = result.items.map(item => {
      const reviews = (item as any).reviews || [];
      const itemReviews = reviews.filter((r: any) => r.reviewerId !== item.ownerId);
      const totalReviews = itemReviews.length;
      const avgRating = totalReviews > 0
        ? Number((itemReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : 0.0;
      
      return {
        ...item,
        averageRating: avgRating,
        reviewCount: totalReviews
      };
    });
    return {
      items,
      meta: result.meta
    };
  }

  static async getItemById(id: string) {
    const item = await ItemRepository.getItemById(id);
    if (!item) {
      throw new NotFoundError('Item not found');
    }
    const reviews = (item as any).reviews || [];
    const itemReviews = reviews.filter((r: any) => r.reviewerId !== item.ownerId);
    const totalReviews = itemReviews.length;
    const avgRating = totalReviews > 0
      ? Number((itemReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0.0;

    return {
      ...item,
      averageRating: avgRating,
      reviewCount: totalReviews
    };
  }

  static async updateItem(id: string, userId: string, data: UpdateItemInput) {
    const item = await this.getItemById(id);
    if (item.ownerId !== userId) {
      throw new ForbiddenError('You can only edit your own items');
    }
    return await ItemRepository.updateItem(id, data);
  }

  static async deleteItem(id: string, userId: string) {
    const item = await this.getItemById(id);
    if (item.ownerId !== userId) {
      throw new ForbiddenError('You can only delete your own items');
    }
    await ItemRepository.deleteItem(id);
    return { message: 'Item deleted successfully' };
  }
}
