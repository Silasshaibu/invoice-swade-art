import { neon, NeonQueryFunction } from '@neondatabase/serverless'

type Sql = NeonQueryFunction<false, false>

let _sql: Sql | undefined

function getDb(): Sql {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    // Clean database URL to remove BOM (Zero-Width No-Break Space) or whitespace
    const dbUrl = process.env.DATABASE_URL.trim().replace(/^\uFEFF/, '')
    _sql = neon(dbUrl)
  }
  return _sql
}

// Lazy proxy — defers neon init to request time, not module evaluation (build time)
export const sql = new Proxy((() => {}) as unknown as Sql, {
  apply(_t, thisArg, args) {
    return Reflect.apply(getDb() as unknown as Function, thisArg, args)
  },
  get(_t, prop) {
    return Reflect.get(getDb(), prop)
  },
})

let initialised = false

export async function initDB() {
  if (initialised) return
  initialised = true

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id              SERIAL PRIMARY KEY,
      email           TEXT UNIQUE NOT NULL,
      password_hash   TEXT NOT NULL,
      is_admin        BOOLEAN DEFAULT FALSE,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Run all ALTER TABLE commands in parallel for faster initialization
  await Promise.all([
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name              TEXT NOT NULL DEFAULT ''`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin    BOOLEAN DEFAULT FALSE`,
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
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token       TEXT`,
    sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ`,
  ])

  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      email      TEXT DEFAULT '',
      phone      TEXT DEFAULT '',
      address    TEXT DEFAULT '',
      company    TEXT DEFAULT '',
      tax_id     TEXT DEFAULT '',
      notes      TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id)`

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id             SERIAL PRIMARY KEY,
      user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_id      INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
      invoice_number TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'draft',
      issue_date     DATE NOT NULL DEFAULT CURRENT_DATE,
      due_date       DATE,
      notes          TEXT DEFAULT '',
      tax_rate       NUMERIC(5,2) DEFAULT 0,
      discount       NUMERIC(10,2) DEFAULT 0,
      subtotal       NUMERIC(10,2) DEFAULT 0,
      tax_amount     NUMERIC(10,2) DEFAULT 0,
      total          NUMERIC(10,2) DEFAULT 0,
      currency       TEXT DEFAULT 'USD',
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS share_token TEXT`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_share_token ON invoices(share_token) WHERE share_token IS NOT NULL`

  await sql`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id          SERIAL PRIMARY KEY,
      invoice_id  INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      quantity    NUMERIC(10,2) NOT NULL DEFAULT 1,
      unit_price  NUMERIC(10,2) NOT NULL DEFAULT 0,
      amount      NUMERIC(10,2) NOT NULL DEFAULT 0
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id           SERIAL PRIMARY KEY,
      invoice_id   INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount       NUMERIC(10,2) NOT NULL,
      payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
      method       TEXT DEFAULT 'bank',
      reference    TEXT DEFAULT '',
      notes        TEXT DEFAULT '',
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS token_blocklist (
      jti        TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
      action     TEXT NOT NULL,
      resource   TEXT NOT NULL,
      resource_id INTEGER,
      changes    TEXT,
      ip_address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS access_requests (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',
      token         TEXT NOT NULL,
      token_expires TIMESTAMPTZ NOT NULL,
      requested_at  TIMESTAMPTZ DEFAULT NOW(),
      decided_at    TIMESTAMPTZ
    )
  `

  // Create all indexes in parallel
  await Promise.all([
    sql`CREATE INDEX IF NOT EXISTS idx_invoices_user   ON invoices(user_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_items_invoice ON invoice_items(invoice_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at)`,
    sql`CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email)`,
    sql`CREATE INDEX IF NOT EXISTS idx_access_requests_token ON access_requests(token)`,
  ])

  // Seed default admin (only if SEED_ADMIN_PASSWORD env var is set)
  const seedPassword = process.env.SEED_ADMIN_PASSWORD
  if (seedPassword) {
    const existing = await sql`SELECT id FROM users WHERE email = 'admin@invoice.swade-art.com' LIMIT 1`
    if (existing.length === 0) {
      const bcrypt = await import('bcryptjs')
      const hash = await bcrypt.hash(seedPassword, 10)
      await sql`
        INSERT INTO users (email, password_hash, name, is_admin)
        VALUES ('admin@invoice.swade-art.com', ${hash}, 'Admin', TRUE)
        ON CONFLICT DO NOTHING
      `
    }
  }

  // Bootstrap exactly one super admin: the earliest-created admin account.
  // No-ops once any super admin exists, so it never overrides a deliberate reassignment.
  await sql`
    UPDATE users SET is_super_admin = TRUE
    WHERE id = (SELECT id FROM users WHERE is_admin = TRUE ORDER BY id ASC LIMIT 1)
      AND NOT EXISTS (SELECT 1 FROM users WHERE is_super_admin = TRUE)
  `
}

export async function ensureInvoiceShareToken(invoiceId: number): Promise<string> {
  const rows = await sql`SELECT share_token FROM invoices WHERE id = ${invoiceId}`
  if (rows.length === 0) throw new Error('Invoice not found')
  if (rows[0].share_token) return rows[0].share_token as string

  const { randomBytes } = await import('crypto')
  const token = randomBytes(24).toString('hex')
  await sql`UPDATE invoices SET share_token = ${token} WHERE id = ${invoiceId}`
  return token
}

export async function nextInvoiceNumber(userId: number): Promise<string> {
  const rows = await sql`
    SELECT invoice_number FROM invoices
    WHERE user_id = ${userId}
    ORDER BY id DESC LIMIT 1
  `
  if (rows.length === 0) return 'INV-0001'
  const last = rows[0].invoice_number as string
  const match = last.match(/(\d+)$/)
  if (!match) return 'INV-0001'
  const next = parseInt(match[1]) + 1
  return `INV-${String(next).padStart(4, '0')}`
}
