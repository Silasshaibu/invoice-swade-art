import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  const { amount, payment_date, method, reference, notes } = await req.json()
  if (!amount) return Response.json({ error: 'amount is required' }, { status: 400 })

  const rows = await sql`
    INSERT INTO payments (invoice_id, user_id, amount, payment_date, method, reference, notes)
    VALUES (${Number(id)}, ${Number(auth.sub)}, ${Number(amount)},
            ${payment_date || new Date().toISOString().split('T')[0]},
            ${method || 'bank'}, ${reference || ''}, ${notes || ''})
    RETURNING *
  `

  // Auto-mark invoice as paid if fully covered
  const invRows = await sql`SELECT total FROM invoices WHERE id = ${Number(id)} AND user_id = ${Number(auth.sub)}`
  if (invRows.length > 0) {
    const totalPaid = await sql`SELECT COALESCE(SUM(amount),0) as paid FROM payments WHERE invoice_id = ${Number(id)}`
    if (Number(totalPaid[0].paid) >= Number(invRows[0].total)) {
      await sql`UPDATE invoices SET status = 'paid', updated_at = NOW() WHERE id = ${Number(id)}`
    }
  }

  return Response.json(rows[0], { status: 201 })
}
