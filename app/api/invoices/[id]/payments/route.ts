import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'
import { sendPaymentReceivedEmail } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  const { amount, payment_date, method, reference, notes } = await req.json()
  if (!amount) return Response.json({ error: 'amount is required' }, { status: 400 })

  const invRows = await sql`SELECT total FROM invoices WHERE id = ${Number(id)} AND user_id = ${Number(auth.sub)}`
  if (invRows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 })

  const rows = await sql`
    INSERT INTO payments (invoice_id, user_id, amount, payment_date, method, reference, notes)
    VALUES (${Number(id)}, ${Number(auth.sub)}, ${Number(amount)},
            ${payment_date || new Date().toISOString().split('T')[0]},
            ${method || 'bank'}, ${reference || ''}, ${notes || ''})
    RETURNING *
  `

  // Auto-mark invoice as paid if fully covered
  const totalPaid = await sql`SELECT COALESCE(SUM(amount),0) as paid FROM payments WHERE invoice_id = ${Number(id)}`
  if (Number(totalPaid[0].paid) >= Number(invRows[0].total)) {
    await sql`UPDATE invoices SET status = 'paid', updated_at = NOW() WHERE id = ${Number(id)}`
  }

  const payment = rows[0]

  // Send email confirmation in background if enabled
  try {
    const userId = Number(auth.sub)
    const userRows = await sql`SELECT name, email, company_name, company_email, email_received FROM users WHERE id = ${userId}`
    const invRows = await sql`SELECT invoice_number, total, currency, client_id FROM invoices WHERE id = ${Number(id)}`
    
    if (userRows.length > 0 && invRows.length > 0) {
      const user = userRows[0]
      const invoice = invRows[0]
      
      const clientRows = await sql`SELECT name, email FROM clients WHERE id = ${Number(invoice.client_id)}`
      if (clientRows.length > 0) {
        const client = clientRows[0]
        
        if (user.email_received && client.email) {
          sendPaymentReceivedEmail(payment, invoice, client, user).catch(err => {
            console.error('Failed to send payment receipt in background:', err)
          })
        }
      }
    }
  } catch (emailErr) {
    console.error('Error triggering payment receipt email:', emailErr)
  }

  return Response.json(payment, { status: 201 })
}
