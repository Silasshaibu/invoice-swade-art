import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const rows = await sql`
    SELECT id, email, name, company_name, company_address, company_phone, company_logo, currency, is_admin
    FROM users WHERE id = ${Number(auth.sub)}
  `
  if (rows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(rows[0])
}

export async function PUT(req: NextRequest) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const body = await req.json()
  const { name, company_name, company_address, company_phone, currency } = body
  const rows = await sql`
    UPDATE users SET
      name = COALESCE(${name}, name),
      company_name = COALESCE(${company_name}, company_name),
      company_address = COALESCE(${company_address}, company_address),
      company_phone = COALESCE(${company_phone}, company_phone),
      currency = COALESCE(${currency}, currency)
    WHERE id = ${Number(auth.sub)}
    RETURNING id, email, name, company_name, company_address, company_phone, currency, is_admin
  `
  return Response.json(rows[0])
}
