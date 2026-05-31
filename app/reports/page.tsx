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

  if (!stats) return <AppShell><div style={{ color: '#6b7280', paddingTop: '40px' }}>Loading…</div></AppShell>

  const fmt = (n: number) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  const pie = [
    { name: 'Paid', value: Number(stats.paid_count) },
    { name: 'Sent', value: Number(stats.sent_count) },
    { name: 'Overdue', value: Number(stats.overdue_count) },
    { name: 'Draft', value: Number(stats.draft_count) },
  ].filter(d => d.value > 0)

  return (
    <AppShell>
      <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '28px' }}>Reports</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Revenue', val: fmt(stats.total_revenue) },
          { label: 'Outstanding', val: fmt(stats.outstanding) },
          { label: 'Overdue', val: fmt(stats.overdue) },
        ].map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#030213' }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px', width: '100%' }}>
        <div className="card" style={{ width: '100%' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthly_revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: unknown) => fmt(Number(v))} />
              <Bar dataKey="revenue" fill="#030213" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ width: '100%' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Invoice Status</h2>
          {pie.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', paddingTop: '120px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No invoices yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
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
