import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { api } from '../lib/api'

interface Stats {
  total_revenue: number; outstanding: number; overdue: number
  paid_count: number; sent_count: number; overdue_count: number; draft_count: number
  monthly_revenue: { month: string; revenue: number }[]
}

const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#94a3b8']

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => { api('/api/dashboard').then(r => r.json()).then(setStats) }, [])

  const fmt = (n: number) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  if (!stats) return <div style={{ color: '#94a3b8', paddingTop: '40px' }}>Loading…</div>

  const pie = [
    { name: 'Paid', value: Number(stats.paid_count) },
    { name: 'Sent', value: Number(stats.sent_count) },
    { name: 'Overdue', value: Number(stats.overdue_count) },
    { name: 'Draft', value: Number(stats.draft_count) },
  ].filter(d => d.value > 0)

  return (
    <>
      <div className="page-header"><h1 className="page-title">Reports</h1></div>
      <div className="stat-grid" style={{ marginBottom: '20px' }}>
        {[
          { label: 'Total Revenue', val: fmt(stats.total_revenue), color: '#22c55e' },
          { label: 'Outstanding', val: fmt(stats.outstanding), color: '#3b82f6' },
          { label: 'Overdue', val: fmt(stats.overdue), color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
        <div className="card">
          <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthly_revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Status Breakdown</h2>
          {pie.length === 0
            ? <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', paddingTop: '40px' }}>No data</div>
            : <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pie} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
          }
        </div>
      </div>
    </>
  )
}
