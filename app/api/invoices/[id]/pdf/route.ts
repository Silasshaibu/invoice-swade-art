import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  const userId = Number(auth.sub)

  const invRows = await sql`
    SELECT i.*, c.name as client_name, c.email as client_email, c.company as client_company,
           c.address as client_address, c.phone as client_phone, c.tax_id as client_tax_id
    FROM invoices i JOIN clients c ON i.client_id = c.id
    WHERE i.id = ${Number(id)} AND i.user_id = ${userId}
  `
  if (invRows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 })

  const inv = invRows[0]
  const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${Number(id)} ORDER BY id`
  const userRows = await sql`SELECT name, company_name, company_address, company_phone, email, currency, company_logo FROM users WHERE id = ${userId}`
  const user = userRows[0]
  const currency = inv.currency || user.currency || 'USD'
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)

  const itemRows = (items as { description: string; quantity: number; unit_price: number; amount: number }[]).map((item) => `
    <tr>
      <td>${item.description}</td>
      <td class="num">${item.quantity}</td>
      <td class="num">${fmt(Number(item.unit_price))}</td>
      <td class="num">${fmt(Number(item.amount))}</td>
    </tr>`).join('')

  const statusColor: Record<string, string> = {
    draft: '#94a3b8', sent: '#3b82f6', paid: '#22c55e', overdue: '#ef4444', cancelled: '#6b7280',
  }
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Invoice ${inv.invoice_number}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: white; padding: 40px; font-size: 14px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .brand { font-size: 24px; font-weight: 700; color: #4f46e5; }
  .company-info { font-size: 13px; color: #64748b; margin-top: 6px; line-height: 1.6; }
  .inv-meta { text-align: right; }
  .inv-number { font-size: 22px; font-weight: 700; color: #1e293b; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; color: white; background: ${statusColor[inv.status] || '#94a3b8'}; margin-top: 6px; }
  .inv-dates { font-size: 13px; color: #64748b; margin-top: 8px; line-height: 1.7; }
  .parties { display: flex; gap: 60px; margin-bottom: 36px; }
  .party h3 { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .party p { font-size: 13px; color: #475569; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  .num { text-align: right; }
  .totals { margin-left: auto; width: 280px; }
  .totals table { margin: 0; }
  .totals td { font-size: 13px; border: none; padding: 5px 12px; }
  .totals .total-row td { font-size: 16px; font-weight: 700; color: #1e293b; border-top: 2px solid #e2e8f0; padding-top: 10px; }
  .notes { margin-top: 36px; padding: 16px; background: #f8fafc; border-radius: 8px; }
  .notes h4 { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .notes p { font-size: 13px; color: #64748b; }
  .footer { margin-top: 48px; text-align: center; font-size: 12px; color: #94a3b8; }
  .logo { max-height: 60px; max-width: 200px; margin-bottom: 8px; display: block; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    ${user.company_logo ? `<img class="logo" src="${user.company_logo}" alt="" />` : ''}
    <div class="brand">${user.company_name || user.name}</div>
    <div class="company-info">
      ${user.company_address ? user.company_address + '<br/>' : ''}
      ${user.company_phone ? user.company_phone + '<br/>' : ''}
      ${user.email}
    </div>
  </div>
  <div class="inv-meta">
    <div class="inv-number">INVOICE</div>
    <div style="font-size:16px;font-weight:600;color:#4f46e5;margin-top:4px;">${inv.invoice_number}</div>
    <div class="status-badge">${inv.status.toUpperCase()}</div>
    <div class="inv-dates">
      <div>Issue Date: ${inv.issue_date}</div>
      ${inv.due_date ? `<div>Due Date: ${inv.due_date}</div>` : ''}
    </div>
  </div>
</div>

<div class="parties">
  <div class="party">
    <h3>Bill To</h3>
    <p><strong>${inv.client_name}</strong><br/>
    ${inv.client_company ? inv.client_company + '<br/>' : ''}
    ${inv.client_email ? inv.client_email + '<br/>' : ''}
    ${inv.client_phone ? inv.client_phone + '<br/>' : ''}
    ${inv.client_address || ''}</p>
  </div>
</div>

<table>
  <thead>
    <tr><th>Description</th><th class="num">Qty</th><th class="num">Unit Price</th><th class="num">Amount</th></tr>
  </thead>
  <tbody>${itemRows}</tbody>
</table>

<div class="totals">
  <table>
    <tr><td>Subtotal</td><td class="num">${fmt(Number(inv.subtotal))}</td></tr>
    ${Number(inv.discount) > 0 ? `<tr><td>Discount</td><td class="num">-${fmt(Number(inv.discount))}</td></tr>` : ''}
    ${Number(inv.tax_rate) > 0 ? `<tr><td>Tax (${inv.tax_rate}%)</td><td class="num">${fmt(Number(inv.tax_amount))}</td></tr>` : ''}
    <tr class="total-row"><td><strong>Total</strong></td><td class="num"><strong>${fmt(Number(inv.total))}</strong></td></tr>
  </table>
</div>

${inv.notes ? `<div class="notes"><h4>Notes</h4><p>${inv.notes}</p></div>` : ''}

<div class="footer">Thank you for your business.</div>
</body>
</html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}
