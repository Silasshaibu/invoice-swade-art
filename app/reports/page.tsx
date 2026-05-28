'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import AppShell from '@/components/AppShell'
import { apiFetch } from '@/lib/auth'
import type { DashboardStats } from '@/types'

const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#94a3b8', '#f59e0b']

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    apiFetch('/api/dashboard').then(r => r.json()).then(setStats)
  }, [])

  if (!stats) return <AppShell><div style={{ color: '#94a3b8', paddingTop: '40px' }}>Loading…</div></AppShell>

  const fmt = (n: number) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  const pie = [
    { name: 'Paid', value: Number(stats.paid_count) },
    { name: 'Sent', value: Number(stats.sent_count) },
    { name: 'Overdue', value: Number(stats.overdue_count) },
    { name: 'Draft', value: Number(stats.draft_count) },
  ].filter(d => d.value > 0)

  return (
    <AppShell>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '28px' }}>Reports</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Revenue', val: fmt(stats.total_revenue), color: '#22c55e' },
          { label: 'Outstanding', val: fmt(stats.outstanding), color: '#3b82f6' },
          { label: 'Overdue', val: fmt(stats.overdue), color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="card" style={{ borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.monthly_revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: unknown) => fmt(Number(v))} />
              <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Invoice Status</h2>
          {pie.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', paddingTop: '60px' }}>No invoices yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AppShell>
  )
}
