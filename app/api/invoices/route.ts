import { NextRequest } from 'next/server'
import { initDB, sql, nextInvoiceNumber, ensureInvoiceShareToken } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'
import { sendInvoiceSentEmail } from '@/lib/email'
import { createInvoiceSchema } from '@/lib/validation'

export async function GET(req: NextRequest) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const clientId = searchParams.get('client_id')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

  let rows
  if (status && clientId) {
    rows = await sql`
      SELECT i.*, c.name as client_name, c.email as client_email, c.company as client_company
      FROM invoices i JOIN clients c ON i.client_id = c.id
      WHERE i.user_id = ${Number(auth.sub)} AND i.status = ${status} AND i.client_id = ${Number(clientId)}
      ORDER BY i.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  } else if (status) {
    rows = await sql`
      SELECT i.*, c.name as client_name, c.email as client_email, c.company as client_company
      FROM invoices i JOIN clients c ON i.client_id = c.id
      WHERE i.user_id = ${Number(auth.sub)} AND i.status = ${status}
      ORDER BY i.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  } else if (clientId) {
    rows = await sql`
      SELECT i.*, c.name as client_name, c.email as client_email, c.company as client_company
      FROM invoices i JOIN clients c ON i.client_id = c.id
      WHERE i.user_id = ${Number(auth.sub)} AND i.client_id = ${Number(clientId)}
      ORDER BY i.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  } else {
    rows = await sql`
      SELECT i.*, c.name as client_name, c.email as client_email, c.company as client_company
      FROM invoices i JOIN clients c ON i.client_id = c.id
      WHERE i.user_id = ${Number(auth.sub)}
      ORDER BY i.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  }
  return Response.json(rows)
}

export async function POST(req: NextRequest) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const userId = Number(auth.sub)
  const body = await req.json()

  const parsed = createInvoiceSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  const {
    client_id, invoice_number, status = 'draft', issue_date, due_date,
    notes, tax_rate = 0, discount = 0, currency = 'USD', items,
  } = parsed.data

  const invNum = invoice_number || await nextInvoiceNumber(userId)

  let subtotal = 0
  const processedItems = items.map((item: { description: string; quantity: number; unit_price: number }) => {
    const amount = Number(item.quantity) * Number(item.unit_price)
    subtotal += amount
    return { ...item, amount }
  })

  const discountAmt = Number(discount)
  const taxableAmount = subtotal - discountAmt
  const taxAmount = taxableAmount * (Number(tax_rate) / 100)
  const total = taxableAmount + taxAmount

  const rows = await sql`
    INSERT INTO invoices (user_id, client_id, invoice_number, status, issue_date, due_date, notes, tax_rate, discount, subtotal, tax_amount, total, currency)
    VALUES (${userId}, ${Number(client_id)}, ${invNum}, ${status},
            ${issue_date || new Date().toISOString().split('T')[0]},
            ${due_date || null}, ${notes || ''},
            ${Number(tax_rate)}, ${discountAmt}, ${subtotal}, ${taxAmount}, ${total}, ${currency})
    RETURNING *
  `
  const invoice = rows[0]

  for (const item of processedItems) {
    await sql`
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount)
      VALUES (${invoice.id}, ${item.description}, ${Number(item.quantity)}, ${Number(item.unit_price)}, ${item.amount})
    `
  }

  // Send email notification if status is 'sent'
  if (status === 'sent') {
    try {
      const userRows = await sql`SELECT name, email, company_name, company_email, email_sent FROM users WHERE id = ${userId}`
      const clientRows = await sql`SELECT name, email, company FROM clients WHERE id = ${Number(client_id)}`
      
      if (userRows.length > 0 && clientRows.length > 0) {
        const user = userRows[0]
        const client = clientRows[0]
        
        if (user.email_sent && client.email) {
          const shareToken = await ensureInvoiceShareToken(invoice.id)
          sendInvoiceSentEmail(invoice, client, user, shareToken).catch(err => {
            console.error('Failed to send invoice email in background:', err)
          })
        }
      }
    } catch (emailErr) {
      console.error('Error triggering invoice email:', emailErr)
    }
  }

  return Response.json(invoice, { status: 201 })
}
