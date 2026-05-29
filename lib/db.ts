import { neon, NeonQueryFunction } from '@neondatabase/serverless'

type Sql = NeonQueryFunction<false, false>

let _sql: Sql | undefined

function getDb(): Sql {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    _sql = neon(process.env.DATABASE_URL)
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
  // Invoice-specific profile columns — safe to run on existing renderfarm users table
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS name            TEXT NOT NULL DEFAULT ''`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name    TEXT DEFAULT ''`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_address TEXT DEFAULT ''`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_phone   TEXT DEFAULT ''`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company_logo    TEXT DEFAULT ''`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS currency        TEXT DEFAULT 'USD'`

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
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_user   ON invoices(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`

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
  await sql`CREATE INDEX IF NOT EXISTS idx_items_invoice ON invoice_items(invoice_id)`

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
  await sql`CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id)`

  await sql`
    CREATE TABLE IF NOT EXISTS token_blocklist (
      jti        TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Seed default admin
  const existing = await sql`SELECT id FROM users LIMIT 1`
  if (existing.length === 0) {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('password123', 10)
    await sql`
      INSERT INTO users (email, password_hash, name, is_admin)
      VALUES ('admin@invoice.swade-art.com', ${hash}, 'Admin', TRUE)
      ON CONFLICT DO NOTHING
    `
  }
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
