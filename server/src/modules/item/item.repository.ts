import { db } from '../../config/db';
import { Prisma, Item, ItemStatus } from '@prisma/client';
import { CreateItemInput, ItemQueryInput, UpdateItemInput } from './item.schema';

export class ItemRepository {
  static async createItem(ownerId: string, data: CreateItemInput, imageUrls: string[]) {
    return await db.item.create({
      data: {
        ownerId,
        title: data.title,
        description: data.description,
        dailyRate: new Prisma.Decimal(data.dailyRate),
        securityDeposit: new Prisma.Decimal(data.securityDeposit),
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

  static async getItems(query: ItemQueryInput) {
    const { page, limit, search, category, condition, ownerId, sort } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {
      status: ItemStatus.ACTIVE,
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

    let orderBy: Prisma.ItemOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { dailyRate: 'asc' };
    if (sort === 'price_desc') orderBy = { dailyRate: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      db.item.findMany({
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
      db.item.count({ where })
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

  static async getItemById(id: string) {
    return await db.item.findFirst({
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

  static async updateItem(id: string, data: UpdateItemInput) {
    const updateData: any = { ...data };
    if (data.dailyRate !== undefined) updateData.dailyRate = new Prisma.Decimal(data.dailyRate);
    if (data.securityDeposit !== undefined) updateData.securityDeposit = new Prisma.Decimal(data.securityDeposit);

    return await db.item.update({
      where: { id },
      data: updateData,
      include: {
        images: true
      }
    });
  }

  static async deleteItem(id: string) {
    // Soft delete
    return await db.item.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: ItemStatus.HIDDEN
      }
    });
  }
}
