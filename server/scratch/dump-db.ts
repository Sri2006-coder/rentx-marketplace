import * as dotenv from 'dotenv';
dotenv.config();

import { db } from '../src/config/db';

async function run() {
  try {
    const usersCount = await db.user.count();
    const itemsCount = await db.item.count();
    const bookingsCount = await db.booking.count();
    const reviewsCount = await db.review.count();
    const paymentsCount = await db.payment.count();
    const trustProfilesCount = await db.trustProfile.count();

    console.log('--- DATABASE METRICS ---');
    console.log(`Users: ${usersCount}`);
    console.log(`Items: ${itemsCount}`);
    console.log(`Bookings: ${bookingsCount}`);
    console.log(`Reviews: ${reviewsCount}`);
    console.log(`Payments: ${paymentsCount}`);
    console.log(`Trust Profiles: ${trustProfilesCount}\n`);

    console.log('--- USERS ---');
    const users = await db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });
    console.log(JSON.stringify(users, null, 2));

    console.log('\n--- ITEMS (First 5) ---');
    const items = await db.item.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        dailyRate: true,
        category: true,
        city: true,
        status: true,
        ownerId: true
      }
    });
    console.log(JSON.stringify(items, null, 2));

    console.log('\n--- BOOKINGS (First 5) ---');
    const bookings = await db.booking.findMany({
      take: 5,
      select: {
        id: true,
        itemId: true,
        renterId: true,
        startDate: true,
        endDate: true,
        totalPrice: true,
        status: true
      }
    });
    console.log(JSON.stringify(bookings, null, 2));

  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await db.$disconnect();
  }
}

run();
