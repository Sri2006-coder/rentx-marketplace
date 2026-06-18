const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  try {
    const users = await db.user.findMany({
      include: {
        trustProfile: true
      }
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await db.$disconnect();
  }
}

main();
