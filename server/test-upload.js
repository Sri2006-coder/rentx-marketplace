const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const token = jwt.sign({ id: '123e4567-e89b-12d3-a456-426614174000', role: 'USER' }, 'rentx_access_secret');

async function testUpload() {
  const formData = new FormData();
  formData.append('title', 'Test Item Title');
  formData.append('description', 'Test Description which is at least 10 chars');
  formData.append('dailyRate', '50');
  formData.append('securityDeposit', '100');
  formData.append('category', 'cameras');
  formData.append('condition', 'excellent');
  formData.append('city', 'New York');
  
  // Create a dummy file
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
  }
}

testUpload();
