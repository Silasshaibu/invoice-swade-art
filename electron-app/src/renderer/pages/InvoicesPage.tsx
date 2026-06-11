import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Page } from '../App'

interface Invoice { id: number; invoice_number: string; client_name: string; issue_date: string; due_date: string; status: string; total: number }
const STATUS_BADGE: Record<string, string> = { draft: 'badge-draft', sent: 'badge-sent', paid: 'badge-paid', overdue: 'badge-overdue', cancelled: 'badge-cancelled' }
const STATUSES = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled']

export default function InvoicesPage({ nav }: { nav: (p: Page) => void }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = (status: string) => {
    setLoading(true)
    const url = status === 'all' ? '/api/invoices' : `/api/invoices?status=${status}`
    api(url).then(r => r.json()).then(d => setInvoices(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }
  useEffect(() => load(filter), [filter])

  const fmt = (n: number) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const filtered = invoices.filter(i => i.invoice_number.toLowerCase().includes(search.toLowerCase()) || i.client_name?.toLowerCase().includes(search.toLowerCase()))

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const toggleSort = () => {
    setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
  }

  const sorted = [...filtered].sort((a, b) => {
    const valA = a.issue_date || ''
    const valB = b.issue_date || ''
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—'
    return dateStr.split('T')[0]
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <button className="btn btn-primary" onClick={() => nav({ name: 'invoice-new' })}>+ New Invoice</button>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setFilter(s); setLoading(true) }} className="btn" style={{
            padding: '5px 12px', fontSize: '12px',
            background: filter === s ? '#4f46e5' : '#f1f5f9',
            color: filter === s ? 'white' : '#64748b',
          }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ maxWidth: '180px', marginLeft: 'auto' }} />
      </div>
      <div className="card" style={{ padding: 0 }}>
        {loading ? <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div> : (
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th onClick={toggleSort} style={{ cursor: 'pointer', userSelect: 'none', color: '#4f46e5' }}>
                  Date <span style={{ fontSize: '11px' }}>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                </th>
                <th>Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No invoices</td></tr>}
              {sorted.map(inv => (
                <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => nav({ name: 'invoice', id: inv.id })}>
                  <td style={{ fontWeight: 600, color: '#4f46e5' }}>{inv.invoice_number}</td>
                  <td>{inv.client_name}</td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}>{formatDate(inv.issue_date)}</td>
                  <td style={{ color: inv.status === 'overdue' ? '#ef4444' : '#64748b', fontSize: '12px' }}>{formatDate(inv.due_date)}</td>
                  <td><span className={`badge ${STATUS_BADGE[inv.status]}`}>{inv.status}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(inv.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
