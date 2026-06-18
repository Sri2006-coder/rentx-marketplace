const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: '123e4567-e89b-12d3-a456-426614174000', role: 'USER' }, 'rentx_access_secret');

fetch('http://localhost:5000/api/v1/bookings/renter', {
  headers: { Authorization: `Bearer ${token}` }
}).then(async r => {
  if (r.ok) console.log('SUCCESS');
  else console.log('ERROR:', r.status, await r.text());
}).catch(e => console.log('FETCH ERROR:', e));
