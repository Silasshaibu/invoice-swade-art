const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('No DATABASE_URL environment variable found in build environment.');
    return;
  }

  console.log('Database URL found. Connecting to database to seed admin user...');
  
  try {
    const sql = neon(dbUrl);
    
    // Ensure the users table exists (like initDB does)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id              SERIAL PRIMARY KEY,
        email           TEXT UNIQUE NOT NULL,
        password_hash   TEXT NOT NULL,
        is_admin        BOOLEAN DEFAULT FALSE,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await Promise.all([
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name              TEXT NOT NULL DEFAULT ''`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name      TEXT DEFAULT ''`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_address   TEXT DEFAULT ''`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_phone     TEXT DEFAULT ''`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_email     TEXT DEFAULT ''`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_website   TEXT DEFAULT ''`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_logo      TEXT DEFAULT ''`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS tax_id            TEXT DEFAULT ''`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS currency          TEXT DEFAULT 'USD'`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_prefix    TEXT DEFAULT 'INV'`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS next_invoice_num  TEXT DEFAULT '001'`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_terms     INTEGER DEFAULT 14`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_notes     TEXT DEFAULT ''`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pdf_template      TEXT DEFAULT 'professional'`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_sent        BOOLEAN DEFAULT TRUE`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_received    BOOLEAN DEFAULT TRUE`,
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_overdue     BOOLEAN DEFAULT TRUE`,
    ]).catch(err => {
      console.log('Note: Some ALTER TABLE commands might have failed or columns already exist.', err.message);
    });

    const email = 'silasshaibu2@gmail.com';
    const password = 'SwadeAdmin2026!'; // Temporary password
    const hash = await bcrypt.hash(password, 10);
    
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    
    if (existing.length > 0) {
      // Update existing user to admin
      await sql`
        UPDATE users 
        SET is_admin = TRUE, name = 'Silas Admin'
        WHERE email = ${email}
      `;
      console.log(`Successfully updated existing user ${email} to be an admin!`);
    } else {
      // Insert new admin user
      await sql`
        INSERT INTO users (email, password_hash, name, is_admin)
        VALUES (${email}, ${hash}, 'Silas Admin', TRUE)
      `;
      console.log(`Successfully created new admin user: ${email} with password: ${password}`);
    }
  } catch (error) {
    console.error('Error seeding admin user during build:', error);
  }
}

main();
