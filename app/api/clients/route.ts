import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const rows = await sql`
    SELECT * FROM clients WHERE user_id = ${Number(auth.sub)} ORDER BY name ASC
  `
  return Response.json(rows)
}

export async function POST(req: NextRequest) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { name, email, phone, address, company, tax_id, notes } = await req.json()
  if (!name) return Response.json({ error: 'name is required' }, { status: 400 })
  const rows = await sql`
    INSERT INTO clients (user_id, name, email, phone, address, company, tax_id, notes)
    VALUES (${Number(auth.sub)}, ${name}, ${email || ''}, ${phone || ''}, ${address || ''}, ${company || ''}, ${tax_id || ''}, ${notes || ''})
    RETURNING *
  `
  return Response.json(rows[0], { status: 201 })
}
