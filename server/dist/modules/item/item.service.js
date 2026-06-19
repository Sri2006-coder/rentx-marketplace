"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemService = void 0;
const item_repository_1 = require("./item.repository");
const AppError_1 = require("../../core/exceptions/AppError");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ItemService {
    static async uploadToCloudinary(fileBuffer, mimetype, folder) {
        try {
            const b64 = fileBuffer.toString('base64');
            const dataURI = `data:${mimetype};base64,${b64}`;
            const result = await cloudinary_1.default.uploader.upload(dataURI, {
                resource_type: 'auto',
            });
            return result.secure_url;
        }
        catch (error) {
            console.warn('Cloudinary upload failed, falling back to local disk storage.');
            const uploadDir = path_1.default.join(process.cwd(), 'public/uploads', folder);
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            const filename = `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
            const filePath = path_1.default.join(uploadDir, filename);
            fs_1.default.writeFileSync(filePath, fileBuffer);
            return `http://localhost:5000/uploads/${folder}/${filename}`;
        }
    }
    static async createItem(ownerId, data, files) {
        // Upload all files concurrently
        const imageUrlPromises = files.map(file => this.uploadToCloudinary(file.buffer, file.mimetype, 'items'));
        const imageUrls = await Promise.all(imageUrlPromises);
        return await item_repository_1.ItemRepository.createItem(ownerId, data, imageUrls);
    }
    static async getItems(query) {
        const result = await item_repository_1.ItemRepository.getItems(query);
        const items = result.items.map(item => {
            const reviews = item.reviews || [];
            const itemReviews = reviews.filter((r) => r.reviewerId !== item.ownerId);
            const totalReviews = itemReviews.length;
            const avgRating = totalReviews > 0
                ? Number((itemReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
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
    static async getItemById(id) {
        const item = await item_repository_1.ItemRepository.getItemById(id);
        if (!item) {
            throw new AppError_1.NotFoundError('Item not found');
        }
        const reviews = item.reviews || [];
        const itemReviews = reviews.filter((r) => r.reviewerId !== item.ownerId);
        const totalReviews = itemReviews.length;
        const avgRating = totalReviews > 0
            ? Number((itemReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
            : 0.0;
        return {
            ...item,
            averageRating: avgRating,
            reviewCount: totalReviews
        };
    }
    static async updateItem(id, userId, data) {
        const item = await this.getItemById(id);
        if (item.ownerId !== userId) {
            throw new AppError_1.ForbiddenError('You can only edit your own items');
        }
        return await item_repository_1.ItemRepository.updateItem(id, data);
    }
    static async deleteItem(id, userId) {
        const item = await this.getItemById(id);
        if (item.ownerId !== userId) {
            throw new AppError_1.ForbiddenError('You can only delete your own items');
        }
        await item_repository_1.ItemRepository.deleteItem(id);
        return { message: 'Item deleted successfully' };
    }
}
exports.ItemService = ItemService;
