import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  const rows = await sql`
    SELECT * FROM clients WHERE id = ${Number(id)} AND user_id = ${Number(auth.sub)}
  `
  if (rows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(rows[0])
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  const { name, email, phone, address, company, tax_id, notes } = await req.json()
  const rows = await sql`
    UPDATE clients SET
      name = COALESCE(${name}, name),
      email = COALESCE(${email}, email),
      phone = COALESCE(${phone}, phone),
      address = COALESCE(${address}, address),
      company = COALESCE(${company}, company),
      tax_id = COALESCE(${tax_id}, tax_id),
      notes = COALESCE(${notes}, notes)
    WHERE id = ${Number(id)} AND user_id = ${Number(auth.sub)}
    RETURNING *
  `
  if (rows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(rows[0])
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  await sql`DELETE FROM clients WHERE id = ${Number(id)} AND user_id = ${Number(auth.sub)}`
  return Response.json({ ok: true })
}
