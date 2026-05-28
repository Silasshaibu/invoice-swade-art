import { NextRequest } from 'next/server'
import { initDB, sql } from '@/lib/db'
import { requireAuth, isAuthError } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  await initDB()
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const userId = Number(auth.sub)

  const [statsRows, recentRows, monthlyRows] = await Promise.all([
    sql`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status IN ('sent','draft') THEN total ELSE 0 END), 0) as outstanding,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN total ELSE 0 END), 0) as overdue,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count
      FROM invoices WHERE user_id = ${userId}
    `,
    sql`
      SELECT i.*, c.name as client_name
      FROM invoices i JOIN clients c ON i.client_id = c.id
      WHERE i.user_id = ${userId}
      ORDER BY i.created_at DESC LIMIT 5
    `,
    sql`
      SELECT TO_CHAR(issue_date, 'YYYY-MM') as month,
             COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0) as revenue
      FROM invoices
      WHERE user_id = ${userId} AND issue_date >= NOW() - INTERVAL '12 months'
      GROUP BY month ORDER BY month ASC
    `,
  ])

  // Auto-mark overdue invoices
  await sql`
    UPDATE invoices SET status = 'overdue', updated_at = NOW()
    WHERE user_id = ${userId} AND status = 'sent' AND due_date < CURRENT_DATE
  `

  return Response.json({
    ...statsRows[0],
    recent_invoices: recentRows,
    monthly_revenue: monthlyRows,
  })
}
