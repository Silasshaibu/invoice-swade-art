'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { apiFetch } from '@/lib/auth'
import type { DashboardStats, Invoice } from '@/types'

const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-draft', sent: 'badge-sent', paid: 'badge-paid', overdue: 'badge-overdue', cancelled: 'badge-cancelled',
}

const STAT_ICONS: Record<string, React.ReactNode> = {
  'Total Revenue': <DollarSign size={20} style={{ color: '#6366f1' }} />,
  'Outstanding': <AlertCircle size={20} style={{ color: '#f59e0b' }} />,
  'Overdue': <AlertCircle size={20} style={{ color: '#ef4444' }} />,
  'Paid Invoices': <CheckCircle size={20} style={{ color: '#22c55e' }} />,
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        {STAT_ICONS[label]}
      </div>
      <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: '#030213' }}>{value}</div>
      {sub && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/dashboard').then(r => r.json()).then(setStats).finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  if (loading) return <AppShell><div style={{ color: '#94a3b8', paddingTop: '40px' }}>Loading…</div></AppShell>
  if (!stats) return <AppShell><div>Failed to load</div></AppShell>

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500 }}>Dashboard</h1>
        <Link href="/invoices/create" className="btn btn-primary">+ New Invoice</Link>
      </div>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px' }}>Overview of your invoicing activity</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="Total Revenue" value={fmt(stats.total_revenue)} />
        <StatCard label="Outstanding" value={fmt(stats.outstanding)} sub={`${Number(stats.sent_count)} invoices`} />
        <StatCard label="Overdue" value={fmt(stats.overdue)} sub={`${Number(stats.overdue_count)} invoices`} />
        <StatCard label="Paid Invoices" value={String(stats.paid_count)} />
      </div>

      <div className="grid-chart">
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Revenue (12 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.monthly_revenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#030213" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#030213" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: unknown) => fmt(Number(v))} />
              <Area type="monotone" dataKey="revenue" stroke="#030213" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Invoices</h2>
            <Link href="/invoices" style={{ fontSize: '13px', color: '#111827', textDecoration: 'none', fontWeight: 500 }}>View all</Link>
          </div>
          {stats.recent_invoices.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No invoices yet</div>
          ) : (
            <div className="table-scroll"><table>
              <thead>
                <tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {stats.recent_invoices.map((inv: Invoice) => (
                  <tr key={inv.id}>
                    <td><Link href={`/invoices/${inv.id}`} style={{ color: '#111827', textDecoration: 'none', fontWeight: 500 }}>{inv.invoice_number}</Link></td>
                    <td>{inv.client_name}</td>
                    <td>{fmt(inv.total)}</td>
                    <td><span className={`badge ${STATUS_BADGE[inv.status]}`}>{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
