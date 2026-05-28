'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AppShell from '@/components/AppShell'
import { apiFetch } from '@/lib/auth'
import type { DashboardStats, Invoice } from '@/types'

const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-draft', sent: 'badge-sent', paid: 'badge-paid', overdue: 'badge-overdue', cancelled: 'badge-cancelled',
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="card" style={{ borderLeft: `4px solid ${color || '#4f46e5'}` }}>
      <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: '#1e293b' }}>{value}</div>
      {sub && <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{sub}</div>}
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Dashboard</h1>
        <Link href="/invoices/create" className="btn btn-primary">+ New Invoice</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="Total Revenue" value={fmt(stats.total_revenue)} color="#22c55e" />
        <StatCard label="Outstanding" value={fmt(stats.outstanding)} sub={`${Number(stats.sent_count)} invoices`} color="#3b82f6" />
        <StatCard label="Overdue" value={fmt(stats.overdue)} sub={`${Number(stats.overdue_count)} invoices`} color="#ef4444" />
        <StatCard label="Paid Invoices" value={String(stats.paid_count)} color="#4f46e5" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Revenue (12 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.monthly_revenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: unknown) => fmt(Number(v))} />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Invoices</h2>
            <Link href="/invoices" style={{ fontSize: '13px', color: '#4f46e5', textDecoration: 'none' }}>View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.recent_invoices.length === 0 && (
              <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No invoices yet</div>
            )}
            {stats.recent_invoices.map((inv: Invoice) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9', color: 'inherit' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{inv.invoice_number}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{inv.client_name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{fmt(inv.total)}</div>
                  <span className={`badge ${STATUS_BADGE[inv.status]}`}>{inv.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
