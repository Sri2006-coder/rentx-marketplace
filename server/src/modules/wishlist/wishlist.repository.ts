import { db } from '@/config/db';

export class WishlistRepository {
  static async addToWishlist(userId: string, itemId: string) {
    return db.wishlist.create({
      data: { userId, itemId },
      include: {
        item: {
          include: {
            images: true,
            owner: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  static async removeFromWishlist(userId: string, itemId: string) {
    return db.wishlist.delete({
      where: {
        userId_itemId: { userId, itemId },
      },
    });
  }

  static async getWishlistByUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      db.wishlist.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          item: {
            include: {
              images: true,
              owner: {
                select: { id: true, firstName: true, lastName: true },
              },
              reviews: {
                select: { rating: true, reviewerId: true },
              },
            },
          },
        },
      }),
      db.wishlist.count({ where: { userId } }),
    ]);

    return {
      items: items.map((w) => {
        const reviews = w.item.reviews || [];
        const itemReviews = reviews.filter((r) => r.reviewerId !== w.item.ownerId);
        const totalReviews = itemReviews.length;
        const avgRating =
          totalReviews > 0
            ? Number(
                (itemReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
              )
            : 0.0;

        return {
          wishlistId: w.id,
          createdAt: w.createdAt,
          item: {
            ...w.item,
            averageRating: avgRating,
            reviewCount: totalReviews,
          },
        };
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async isItemInWishlist(userId: string, itemId: string) {
    const entry = await db.wishlist.findUnique({
      where: {
        userId_itemId: { userId, itemId },
      },
    });
    return !!entry;
  }

  static async getWishlistCount(userId: string) {
    return db.wishlist.count({ where: { userId } });
  }
}
