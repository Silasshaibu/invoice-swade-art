const https = require('https');

const postData = JSON.stringify({
  secret: 'swade-secure-reset-2026',
  password: 'SwadeAdmin2026!'
});

const hostname = 'invoiceswade-artcom.vercel.app';

console.log(`Sending POST to https://${hostname}/api/setup...`);

const req = https.request({
  hostname: hostname,
  port: 443,
  path: '/api/setup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  },
  timeout: 10000
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(`Response from ${hostname} (status ${res.statusCode}):`);
    console.log(data);
    if (res.statusCode === 200) {
      console.log('Setup successfully completed!');
    }
  });
});

req.on('error', (e) => {
  console.error(`Error with ${hostname}:`, e.message);
});

req.write(postData);
req.end();
