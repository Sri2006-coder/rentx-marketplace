import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}
