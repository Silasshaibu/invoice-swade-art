import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'
import { sendInvoiceSentEmail } from '@/lib/email'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  const rows = await sql`
    SELECT i.*, c.name as client_name, c.email as client_email, c.company as client_company,
           c.address as client_address, c.phone as client_phone, c.tax_id as client_tax_id
    FROM invoices i JOIN clients c ON i.client_id = c.id
    WHERE i.id = ${Number(id)} AND i.user_id = ${Number(auth.sub)}
  `
  if (rows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 })
  const invoice = rows[0]
  const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${Number(id)} ORDER BY id`
  const payments = await sql`SELECT * FROM payments WHERE invoice_id = ${Number(id)} ORDER BY payment_date DESC`
  return Response.json({ ...invoice, items, payments })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  const body = await req.json()
  const { client_id, invoice_number, status, issue_date, due_date, notes, tax_rate, discount, currency, items } = body

  const existing = await sql`SELECT subtotal, tax_rate, discount FROM invoices WHERE id = ${Number(id)} AND user_id = ${Number(auth.sub)}`
  if (existing.length === 0) return Response.json({ error: 'Not found' }, { status: 404 })

  // Recompute totals if items provided, otherwise keep the existing subtotal
  let subtotal = Number(existing[0].subtotal)
  if (items) {
    subtotal = 0
    for (const item of items) {
      subtotal += Number(item.quantity) * Number(item.unit_price)
    }
  }

  const discountAmt = discount !== undefined ? Number(discount) : Number(existing[0].discount)
  const taxRateVal = tax_rate !== undefined ? Number(tax_rate) : Number(existing[0].tax_rate)
  const taxableAmount = subtotal - discountAmt
  const taxAmount = taxableAmount * (taxRateVal / 100)
  const total = taxableAmount + taxAmount

  const rows = await sql`
    UPDATE invoices SET
      client_id = COALESCE(${client_id ? Number(client_id) : null}, client_id),
      invoice_number = COALESCE(${invoice_number}, invoice_number),
      status = COALESCE(${status}, status),
      issue_date = COALESCE(${issue_date}, issue_date),
      due_date = COALESCE(${due_date}, due_date),
      notes = COALESCE(${notes}, notes),
      tax_rate = ${taxRateVal},
      discount = ${discountAmt},
      subtotal = ${subtotal},
      tax_amount = ${taxAmount},
      total = ${total},
      currency = COALESCE(${currency}, currency),
      updated_at = NOW()
    WHERE id = ${Number(id)} AND user_id = ${Number(auth.sub)}
    RETURNING *
  `
  if (rows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 })

  if (items) {
    await sql`DELETE FROM invoice_items WHERE invoice_id = ${Number(id)}`
    for (const item of items) {
      const amt = Number(item.quantity) * Number(item.unit_price)
      await sql`
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount)
        VALUES (${Number(id)}, ${item.description}, ${Number(item.quantity)}, ${Number(item.unit_price)}, ${amt})
      `
    }
  }

  const invoice = rows[0]

  if (status === 'sent') {
    try {
      const userId = Number(auth.sub)
      const userRows = await sql`SELECT name, email, company_name, company_email, email_sent FROM users WHERE id = ${userId}`
      const clientRows = await sql`SELECT name, email, company FROM clients WHERE id = ${Number(invoice.client_id)}`
      
      if (userRows.length > 0 && clientRows.length > 0) {
        const user = userRows[0]
        const client = clientRows[0]
        
        if (user.email_sent && client.email) {
          sendInvoiceSentEmail(invoice, client, user).catch(err => {
            console.error('Failed to send invoice email in background:', err)
          })
        }
      }
    } catch (emailErr) {
      console.error('Error triggering invoice email:', emailErr)
    }
  }

  return Response.json(invoice)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  await sql`DELETE FROM invoices WHERE id = ${Number(id)} AND user_id = ${Number(auth.sub)}`
  return Response.json({ ok: true })
}
