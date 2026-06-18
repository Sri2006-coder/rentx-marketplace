const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fetch = require('node-fetch');

async function approveAll() {
  const pendingProfiles = await prisma.trustProfile.findMany({
    where: { aadhaarStatus: 'PENDING' }
  });

  for (const profile of pendingProfiles) {
    try {
      console.log(`Approving user: ${profile.userId}`);
      const res = await fetch(`http://localhost:5000/api/v1/verification/approve/${profile.userId}`, {
        method: 'PUT'
      });
      const data = await res.json();
      console.log('Result:', data);
    } catch (e) {
      console.error(e);
    }
  }
}

approveAll();
