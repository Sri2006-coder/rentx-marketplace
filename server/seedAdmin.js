const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@rentx.com';
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        firstName: 'RentX',
        lastName: 'Admin',
        email,
        passwordHash,
        role: 'ADMIN',
      }
    });
    console.log('Admin user created:', admin.email);
  } else {
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', passwordHash }
    });
    console.log('Admin user updated:', existingAdmin.email);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
