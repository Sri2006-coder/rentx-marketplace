const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function test() {
  const user = await db.user.findFirst();
  console.log('USER ID:', user?.id);

  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user?.id, role: 'USER' }, process.env.JWT_SECRET || 'rentx_access_secret');

  const formData = new FormData();
  formData.append('title', 'Test Item Title');
  formData.append('description', 'Test Description which is at least 10 chars');
  formData.append('dailyRate', '50');
  formData.append('securityDeposit', '100');
  formData.append('category', 'cameras');
  formData.append('condition', 'excellent');
  formData.append('city', 'New York');
  
  const blob = new Blob(['dummy content'], { type: 'text/plain' });
  formData.append('images', blob, 'test.txt');

  try {
    const r = await fetch('http://localhost:5000/api/v1/items', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    console.log('STATUS:', r.status);
    console.log('BODY:', await r.text());
  } catch (e) {
    console.log('ERROR:', e);
  } finally {
    await db.$disconnect();
  }
}
test();
