import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './src/config/db';

async function main() {
  const admin = await db.user.findUnique({ where: { email: 'admin@rentx.com' } });
  console.log('Admin user:', admin);
}
main().then(() => process.exit(0)).catch(console.error);
