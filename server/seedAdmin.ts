import * as dotenv from 'dotenv';
dotenv.config();

import { db as prisma } from './src/config/db';
import bcrypt from 'bcrypt';

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
        status: 'ACTIVE'
      }
    });
    console.log('Admin user created:', admin.email);
  } else {
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', passwordHash, status: 'ACTIVE' }
    });
    console.log('Admin user updated:', existingAdmin.email);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
