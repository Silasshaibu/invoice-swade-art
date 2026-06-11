const https = require('https');

const postData = JSON.stringify({
  secret: 'swade-secure-reset-2026',
  password: 'SwadeAdmin2026!'
});

const targets = [
  'invoiceswade-art-com.vercel.app',
  'invoice-swade-art-com.vercel.app',
  'invoiceswade-art-silas-projects2.vercel.app',
  'invoice-swade-art-silas-projects2.vercel.app'
];

function makeRequest(hostname) {
  return new Promise((resolve) => {
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
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Response from ${hostname} (status ${res.statusCode}):`);
        console.log(data.slice(0, 500)); // print first 500 chars
        resolve(res.statusCode);
      });
    });

    req.on('error', (e) => {
      console.error(`Error with ${hostname}:`, e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  for (const target of targets) {
    await makeRequest(target);
  }
}

run();
