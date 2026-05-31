import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'
import { createPaymentSchema } from '@/lib/validation'

export async function GET(req: NextRequest) {
  await initDB()

  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth

  const payments = await sql`
    SELECT
      p.id, p.invoice_id, p.amount, p.payment_date, p.method, p.reference, p.notes, p.created_at,
      i.invoice_number, c.name as client_name
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    JOIN clients c ON i.client_id = c.id
    WHERE p.user_id = ${Number(auth.sub)}
    ORDER BY p.payment_date DESC
  `

  return Response.json(payments)
}

export async function POST(req: NextRequest) {
  await initDB()

  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth

  try {
    const body = await req.json()
    const { invoice_id, amount, payment_date, method, reference, notes } = createPaymentSchema.parse(body)

    const result = await sql`
      INSERT INTO payments (invoice_id, user_id, amount, payment_date, method, reference, notes)
      VALUES (${invoice_id}, ${Number(auth.sub)}, ${amount}, ${payment_date}, ${method || 'bank'}, ${reference || ''}, ${notes || ''})
      RETURNING *
    `

    return Response.json(result[0], { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      return Response.json({ error: 'Invalid input', details: error }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
