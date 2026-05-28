import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../lib/api'
import type { Page } from '../App'

interface Stats {
  total_revenue: number; outstanding: number; overdue: number
  paid_count: number; sent_count: number; overdue_count: number; draft_count: number
  recent_invoices: { id: number; invoice_number: string; client_name: string; total: number; status: string }[]
  monthly_revenue: { month: string; revenue: number }[]
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-draft', sent: 'badge-sent', paid: 'badge-paid', overdue: 'badge-overdue', cancelled: 'badge-cancelled',
}

export default function DashboardPage({ nav }: { nav: (p: Page) => void }) {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => { api('/api/dashboard').then(r => r.json()).then(setStats) }, [])

  const fmt = (n: number) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  if (!stats) return <div style={{ color: '#94a3b8', paddingTop: '40px' }}>Loading…</div>

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <button className="btn btn-primary" onClick={() => nav({ name: 'invoice-new' })}>+ New Invoice</button>
      </div>

      <div className="stat-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div className="stat-label">Revenue</div>
          <div className="stat-value">{fmt(stats.total_revenue)}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">{fmt(stats.outstanding)}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{Number(stats.sent_count)} invoices</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{fmt(stats.overdue)}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{Number(stats.overdue_count)} invoices</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #4f46e5' }}>
          <div className="stat-label">Paid</div>
          <div className="stat-value">{Number(stats.paid_count)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
        <div className="card">
          <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Revenue (12 months)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.monthly_revenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }}/>
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `$${v}`}/>
              <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']}/>
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#rev)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600 }}>Recent Invoices</h2>
            <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={() => nav({ name: 'invoices' })}>View all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.recent_invoices.length === 0 && <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '16px' }}>No invoices yet</div>}
            {stats.recent_invoices.map(inv => (
              <div key={inv.id} onClick={() => nav({ name: 'invoice', id: inv.id })} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '8px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{inv.invoice_number}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{inv.client_name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{fmt(inv.total)}</div>
                  <span className={`badge ${STATUS_BADGE[inv.status]}`}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
