import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { renderInvoicePdfHtml } from '@/lib/invoice-pdf'

// Public, unauthenticated: the high-entropy share_token itself is the credential,
// so a client with the emailed link can view their invoice without ever logging in.
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  await initDB()
  const { token } = await params
  if (!token) return Response.json({ error: 'Not found' }, { status: 404 })

  const invRows = await sql`
    SELECT i.*, c.name as client_name, c.email as client_email, c.company as client_company,
           c.address as client_address, c.phone as client_phone, c.tax_id as client_tax_id
    FROM invoices i JOIN clients c ON i.client_id = c.id
    WHERE i.share_token = ${token}
  `
  if (invRows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 })

  const inv = invRows[0]
  const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${inv.id} ORDER BY id`
  const userRows = await sql`SELECT name, company_name, company_address, company_phone, email, currency, company_logo FROM users WHERE id = ${inv.user_id}`
  const user = userRows[0]

  const html = renderInvoicePdfHtml(inv, items as any, user)
  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}
