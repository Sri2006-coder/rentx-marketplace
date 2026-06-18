import * as dotenv from 'dotenv';
dotenv.config();

import { db } from '../src/config/db';
import bcrypt from 'bcrypt';

async function clean() {
  try {
    console.log('Cleaning database...');
    // Deleting in order of dependencies:
    await db.dispute.deleteMany({});
    await db.payment.deleteMany({});
    await db.review.deleteMany({});
    await db.auditLog.deleteMany({});
    await db.availability.deleteMany({});
    await db.wishlist.deleteMany({});
    await db.booking.deleteMany({});
    await db.itemImage.deleteMany({});
    await db.item.deleteMany({});
    await db.trustProfile.deleteMany({});
    await db.user.deleteMany({});
    console.log('All tables cleared.');

    // Seed admin user
    console.log('Seeding admin user...');
    const email = 'admin@rentx.com';
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await db.user.create({
      data: {
        firstName: 'RentX',
        lastName: 'Admin',
        email,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log('Admin user created successfully:', admin.email);
  } catch (err) {
    console.error('Error cleaning database:', err);
  } finally {
    await db.$disconnect();
  }
}

clean();
