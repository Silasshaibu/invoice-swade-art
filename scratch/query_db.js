process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function main() {
  // Try to find a database URL from env files
  let dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    const envProdPath = path.join(__dirname, '../.env.production');
    if (fs.existsSync(envProdPath)) {
      const content = fs.readFileSync(envProdPath, 'utf8');
      const match = content.match(/DATABASE_URL=(.+)/);
      if (match) {
        dbUrl = match[1].trim();
      }
    }
  }

  if (!dbUrl) {
    const envLocalPath = path.join(__dirname, '../.env.local');
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      const match = content.match(/DATABASE_URL=(.+)/);
      if (match) {
        dbUrl = match[1].trim();
      }
    }
  }

  if (!dbUrl) {
    console.error('No DATABASE_URL found!');
    process.exit(1);
  }

  console.log('Using DATABASE_URL:', dbUrl);

  try {
    const sql = neon(dbUrl);
    const users = await sql`SELECT id, email, password_hash, is_admin FROM users`;
    console.log('Users found:');
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Failed to query database:', err);
  }
}

main();
