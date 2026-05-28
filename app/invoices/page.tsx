'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import { apiFetch } from '@/lib/auth'
import type { Invoice, InvoiceStatus } from '@/types'

const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-draft', sent: 'badge-sent', paid: 'badge-paid', overdue: 'badge-overdue', cancelled: 'badge-cancelled',
}

const STATUSES: (InvoiceStatus | 'all')[] = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled']

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const load = async (status: InvoiceStatus | 'all') => {
    setLoading(true)
    const url = status === 'all' ? '/api/invoices' : `/api/invoices?status=${status}`
    const data = await apiFetch(url).then(r => r.json())
    setInvoices(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load(filter) }, [filter])

  const fmt = (n: number) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  const filtered = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    (inv.client_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Invoices</h1>
        <Link href="/invoices/new" className="btn btn-primary">+ New Invoice</Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className="btn" style={{
            padding: '6px 14px', fontSize: '13px',
            background: filter === s ? '#4f46e5' : '#f1f5f9',
            color: filter === s ? 'white' : '#64748b',
            border: 'none',
          }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ maxWidth: '200px', marginLeft: 'auto' }} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
        ) : (
          <table>
            <thead>
              <tr><th>Invoice #</th><th>Client</th><th>Date</th><th>Due</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No invoices</td></tr>
              )}
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td><Link href={`/invoices/${inv.id}`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>{inv.invoice_number}</Link></td>
                  <td>{inv.client_name}</td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>{inv.issue_date}</td>
                  <td style={{ color: inv.status === 'overdue' ? '#ef4444' : '#64748b', fontSize: '13px' }}>{inv.due_date || '—'}</td>
                  <td><span className={`badge ${STATUS_BADGE[inv.status]}`}>{inv.status}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(inv.total)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/invoices/${inv.id}`} className="btn btn-ghost" style={{ fontSize: '13px' }}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  )
}
