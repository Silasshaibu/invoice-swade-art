import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const rows = await sql`
    SELECT id, email, name, company_name, company_address, company_phone, company_email, company_website,
           company_logo, tax_id, currency, invoice_prefix, next_invoice_num, payment_terms, invoice_notes,
           pdf_template, email_sent, email_received, email_overdue, is_admin
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
  const {
    name, company_name, company_address, company_phone, company_email, company_website,
    currency, tax_id, invoice_prefix, next_invoice_num, payment_terms, invoice_notes,
    pdf_template, email_sent, email_received, email_overdue
  } = body

  const rows = await sql`
    UPDATE users SET
      name = COALESCE(${name}, name),
      company_name = COALESCE(${company_name}, company_name),
      company_address = COALESCE(${company_address}, company_address),
      company_phone = COALESCE(${company_phone}, company_phone),
      company_email = COALESCE(${company_email}, company_email),
      company_website = COALESCE(${company_website}, company_website),
      currency = COALESCE(${currency}, currency),
      tax_id = COALESCE(${tax_id}, tax_id),
      invoice_prefix = COALESCE(${invoice_prefix}, invoice_prefix),
      next_invoice_num = COALESCE(${next_invoice_num}, next_invoice_num),
      payment_terms = COALESCE(${payment_terms}, payment_terms),
      invoice_notes = COALESCE(${invoice_notes}, invoice_notes),
      pdf_template = COALESCE(${pdf_template}, pdf_template),
      email_sent = COALESCE(${email_sent}, email_sent),
      email_received = COALESCE(${email_received}, email_received),
      email_overdue = COALESCE(${email_overdue}, email_overdue)
    WHERE id = ${Number(auth.sub)}
    RETURNING id, email, name, company_name, company_address, company_phone, company_email, company_website,
              currency, tax_id, invoice_prefix, next_invoice_num, payment_terms, invoice_notes,
              pdf_template, email_sent, email_received, email_overdue, is_admin
  `
  return Response.json(rows[0])
}
