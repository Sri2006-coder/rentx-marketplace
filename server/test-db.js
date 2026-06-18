const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function test() {
  try {
    const items = await db.item.findMany({
      where: { deletedAt: null, ownerId: '123e4567-e89b-12d3-a456-426614174000' },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 10,
      include: {
        images: true,
        owner: { select: { id: true, firstName: true, lastName: true, profileImage: true } }
      }
    });
    console.log('SUCCESS:', items);
  } catch(e) {
    console.log('DB ERROR:', e);
  } finally {
    await db.$disconnect();
  }
}

test();
