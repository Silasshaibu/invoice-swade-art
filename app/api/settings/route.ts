import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  await initDB()

  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth

  const rows = await sql`
    SELECT
      invoice_prefix, next_invoice_num, payment_terms, invoice_notes,
      pdf_template, email_sent, email_received, email_overdue
    FROM users WHERE id = ${Number(auth.sub)}
  `

  if (rows.length === 0) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  return Response.json(rows[0])
}

export async function PUT(req: NextRequest) {
  await initDB()

  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth

  const {
    invoice_prefix,
    next_invoice_num,
    payment_terms,
    invoice_notes,
    pdf_template,
    email_sent,
    email_received,
    email_overdue,
  } = await req.json()

  await sql`
    UPDATE users
    SET
      invoice_prefix = COALESCE(${invoice_prefix}, invoice_prefix),
      next_invoice_num = COALESCE(${next_invoice_num}, next_invoice_num),
      payment_terms = COALESCE(${payment_terms}, payment_terms),
      invoice_notes = COALESCE(${invoice_notes}, invoice_notes),
      pdf_template = COALESCE(${pdf_template}, pdf_template),
      email_sent = COALESCE(${email_sent}, email_sent),
      email_received = COALESCE(${email_received}, email_received),
      email_overdue = COALESCE(${email_overdue}, email_overdue)
    WHERE id = ${Number(auth.sub)}
  `

  return Response.json({ success: true })
}
