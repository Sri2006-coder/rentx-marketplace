"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRepository = void 0;
const db_1 = require("../../config/db");
const client_1 = require("@prisma/client");
class ItemRepository {
    static async createItem(ownerId, data, imageUrls) {
        return await db_1.db.item.create({
            data: {
                ownerId,
                title: data.title,
                description: data.description,
                dailyRate: new client_1.Prisma.Decimal(data.dailyRate),
                securityDeposit: new client_1.Prisma.Decimal(data.securityDeposit),
                category: data.category,
                condition: data.condition,
                city: data.city,
                state: data.state,
                requireVerified: data.requireVerified || false,
                images: {
                    create: imageUrls.map((url, index) => ({
                        imageUrl: url,
                        isPrimary: index === 0
                    }))
                }
            },
            include: {
                images: true
            }
        });
    }
    static async getItems(query) {
        const { page, limit, search, category, condition, ownerId, sort } = query;
        const skip = (page - 1) * limit;
        const where = {
            status: client_1.ItemStatus.ACTIVE,
            deletedAt: null
        };
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }
        if (category) {
            where.category = category;
        }
        if (condition) {
            where.condition = condition;
        }
        if (ownerId) {
            where.ownerId = ownerId;
            // Allow owners to see their inactive items
            delete where.status;
        }
        let orderBy = { createdAt: 'desc' };
        if (sort === 'price_asc')
            orderBy = { dailyRate: 'asc' };
        if (sort === 'price_desc')
            orderBy = { dailyRate: 'desc' };
        if (sort === 'newest')
            orderBy = { createdAt: 'desc' };
        const [items, total] = await Promise.all([
            db_1.db.item.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    images: true,
                    owner: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profileImage: true
                        }
                    },
                    reviews: {
                        select: {
                            rating: true,
                            reviewerId: true
                        }
                    }
                }
            }),
            db_1.db.item.count({ where })
        ]);
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    static async getItemById(id) {
        return await db_1.db.item.findFirst({
            where: { id, deletedAt: null },
            include: {
                images: true,
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true
                    }
                },
                reviews: {
                    select: {
                        rating: true,
                        reviewerId: true
                    }
                }
            }
        });
    }
    static async updateItem(id, data) {
        const updateData = { ...data };
        if (data.dailyRate !== undefined)
            updateData.dailyRate = new client_1.Prisma.Decimal(data.dailyRate);
        if (data.securityDeposit !== undefined)
            updateData.securityDeposit = new client_1.Prisma.Decimal(data.securityDeposit);
        return await db_1.db.item.update({
            where: { id },
            data: updateData,
            include: {
                images: true
            }
        });
    }
    static async deleteItem(id) {
        // Soft delete
        return await db_1.db.item.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: client_1.ItemStatus.HIDDEN
            }
        });
    }
}
exports.ItemRepository = ItemRepository;
