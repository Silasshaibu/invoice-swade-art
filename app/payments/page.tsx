'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Download } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { apiFetch } from '@/lib/auth'
import type { Payment } from '@/types'

interface PaymentWithDetails extends Payment {
  invoice_number?: string
  client_name?: string
  status?: 'completed' | 'processing' | 'failed'
}

const PAYMENT_METHODS: Record<string, string> = {
  'credit_card': 'Credit Card',
  'bank_transfer': 'Bank Transfer',
  'check': 'Check',
  'cash': 'Cash',
  'stripe': 'Stripe',
  'paypal': 'PayPal',
}

const STATUS_BADGE: Record<string, string> = {
  'completed': '#1f2937',
  'processing': '#f59e0b',
  'failed': '#ef4444',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [method, setMethod] = useState('all')

  useEffect(() => {
    apiFetch('/api/payments').then(r => r.json()).then(setPayments).finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const filtered = payments.filter(p => {
    const matchSearch = !search || (p.reference || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.invoice_number || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.client_name || '').toLowerCase().includes(search.toLowerCase())

    const matchMethod = method === 'all' || p.method === method

    const pDate = new Date(p.payment_date)
    const matchFrom = !dateFrom || pDate >= new Date(dateFrom)
    const matchTo = !dateTo || pDate <= new Date(dateTo)

    return matchSearch && matchMethod && matchFrom && matchTo
  })

  const stats = {
    total_received: filtered.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    processing: filtered.filter(p => p.status === 'processing').reduce((sum, p) => sum + Number(p.amount || 0), 0),
    count: filtered.length,
  }

  const methods = ['all', ...new Set(payments.map(p => p.method || 'cash'))]

  const exportCSV = () => {
    const headers = ['Payment ID', 'Invoice', 'Client', 'Amount', 'Method', 'Date', 'Status']
    const rows = filtered.map(p => [
      `PAY-${String(p.id).padStart(3, '0')}`,
      p.invoice_number || '',
      p.client_name || '',
      p.amount,
      PAYMENT_METHODS[p.method || 'cash'] || p.method || '',
      new Date(p.payment_date).toISOString().split('T')[0],
      p.status || 'completed'
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const exportPDF = () => {
    alert('PDF export coming soon')
  }

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '4px' }}>Payments</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Track all payment transactions</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportCSV} className="btn btn-ghost" style={{ fontSize: '13px', gap: '6px' }}>
            <Download size={16} />
            CSV
          </button>
          <button onClick={exportPDF} className="btn btn-ghost" style={{ fontSize: '13px', gap: '6px' }}>
            <Download size={16} />
            PDF
          </button>
          <button className="btn btn-ghost" style={{ fontSize: '13px', gap: '6px' }} disabled>
            <Download size={16} />
            Bulk PDF ({filtered.length})
          </button>
          <button className="btn btn-ghost" style={{ fontSize: '13px', gap: '6px' }} disabled>
            <Download size={16} />
            Bulk CSV ({filtered.length})
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 380px', gap: '16px', marginBottom: '28px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}>Total Received</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#030213' }}>{fmt(stats.total_received)}</div>
            </div>
            <span style={{ fontSize: '20px' }}>$</span>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>This month</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}>Processing</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#030213' }}>{fmt(stats.processing)}</div>
            </div>
            <span style={{ fontSize: '20px' }}>📅</span>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Pending clearance</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}>Transactions</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#030213' }}>{stats.count}</div>
            </div>
            <span style={{ fontSize: '20px' }}>$</span>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>This month</div>
        </div>

        <div className="card" style={{ gridColumn: '4', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '6px' }}>Payment Methods</div>
            {methods.filter(m => m !== 'all').length === 0 ? (
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>No payments yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {methods.filter(m => m !== 'all').map(m => {
                  const count = filtered.filter(p => p.method === m).length
                  const amount = filtered.filter(p => p.method === m).reduce((sum, p) => sum + Number(p.amount || 0), 0)
                  return (
                    <div key={m} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', color: '#6b7280', padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
                      <span>{PAYMENT_METHODS[m] || m}</span>
                      <span style={{ fontWeight: 600, color: '#030213' }}>{count} • {fmt(amount)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', alignItems: 'end' }}>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by payment ID, invoice, or client…" />
          <select className="input" value={method} onChange={e => setMethod(e.target.value)} style={{ maxWidth: '140px' }}>
            <option value="all">All Methods</option>
            {methods.filter(m => m !== 'all').map(m => (
              <option key={m} value={m}>{PAYMENT_METHODS[m] || m}</option>
            ))}
          </select>
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr 80px 1fr 80px', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>📅 Date Range:</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input" style={{ maxWidth: '120px', fontSize: '13px' }} />
          </div>
          <span style={{ textAlign: 'center', color: '#6b7280' }}>to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input" style={{ maxWidth: '120px', fontSize: '13px' }} />
          <div style={{ textAlign: 'right' }}>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo('') }} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>Clear</button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading…</div>
        ) : (
          <div className="table-scroll"><table>
            <thead>
              <tr><th>Payment ID</th><th>Invoice</th><th>Client</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  {search || dateFrom || dateTo || method !== 'all' ? 'No payments match your filters' : 'No payments yet'}
                </td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500, color: '#0066cc' }}><Link href={`/payments/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>PAY-{String(p.id).padStart(3, '0')}</Link></td>
                  <td><Link href={`/invoices/${p.invoice_id}`} style={{ textDecoration: 'none', color: '#0066cc' }}>{p.invoice_number || '—'}</Link></td>
                  <td>{p.client_name || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(p.amount)}</td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>{PAYMENT_METHODS[p.method || 'cash'] || p.method || '—'}</td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td><span style={{ fontSize: '12px', fontWeight: 600, color: 'white', backgroundColor: STATUS_BADGE[p.status || 'completed'], padding: '4px 12px', borderRadius: '4px' }}>{(p.status || 'completed').charAt(0).toUpperCase() + (p.status || 'completed').slice(1)}</span></td>
                  <td><Link href={`/invoices/${p.invoice_id}`} style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 500, fontSize: '13px' }}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </AppShell>
  )
}
