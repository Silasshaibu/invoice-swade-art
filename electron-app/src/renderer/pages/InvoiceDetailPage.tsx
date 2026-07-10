import { useEffect, useState } from 'react'
import { api, API_BASE } from '../lib/api'
import type { Page } from '../App'

interface InvData {
  id: number; invoice_number: string; status: string; issue_date: string; due_date: string
  client_name: string; client_company: string; client_email: string
  subtotal: number; discount: number; tax_rate: number; tax_amount: number; total: number
  currency: string; notes: string
  items: { description: string; quantity: number; unit_price: number; amount: number }[]
  payments: { id: number; payment_date: string; method: string; reference: string; amount: number }[]
}

const STATUS_BADGE: Record<string, string> = { draft: 'badge-draft', sent: 'badge-sent', paid: 'badge-paid', overdue: 'badge-overdue', cancelled: 'badge-cancelled' }

export default function InvoiceDetailPage({ id, nav }: { id: number; nav: (p: Page) => void }) {
  const [inv, setInv] = useState<InvData | null>(null)
  const [payVisible, setPayVisible] = useState(false)
  const [payForm, setPayForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], method: 'bank', reference: '' })
  const [payLoading, setPayLoading] = useState(false)

  const load = () => api(`/api/invoices/${id}`).then(r => r.json()).then(setInv)
  useEffect(() => { load() }, [id])

  const markStatus = async (status: string) => { await api(`/api/invoices/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); load() }
  const del = async () => { if (!confirm('Delete?')) return; await api(`/api/invoices/${id}`, { method: 'DELETE' }); nav({ name: 'invoices' }) }

  const addPayment = async (e: React.FormEvent) => {
    e.preventDefault(); setPayLoading(true)
    await api(`/api/invoices/${id}/payments`, { method: 'POST', body: JSON.stringify({ ...payForm, amount: Number(payForm.amount) }) })
    setPayLoading(false); setPayVisible(false); load()
  }

  const printPDF = async () => {
    const token = localStorage.getItem('inv_token')
    const url = `${API_BASE}/api/invoices/${id}/pdf`
    // Open in external browser for printing
    if (window.electronAPI) {
      // In electron, open in default browser
      const { shell } = await import('electron')
      void shell
      window.open(url)
    } else {
      window.open(url, '_blank')
    }
    // Also try to fetch and print via electron if available
    if (window.electronAPI?.printToPDF) {
      try {
        const html = await fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.text())
        const win = window.open('', '_blank')
        if (win) { win.document.write(html); win.document.close(); win.print() }
      } catch {}
    }
  }

  const fmt = (n: number) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—'
    return dateStr.split('T')[0]
  }

  if (!inv) return <div style={{ color: '#94a3b8', paddingTop: '40px' }}>Loading…</div>

  const totalPaid = (inv.payments || []).reduce((s, p) => s + Number(p.amount), 0)
  const balance = Number(inv.total) - totalPaid

  return (
    <>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={() => nav({ name: 'invoices' })}>←</button>
          <h1 className="page-title">{inv.invoice_number}</h1>
          <span className={`badge ${STATUS_BADGE[inv.status]}`} style={{ fontSize: '12px' }}>{inv.status}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" style={{ fontSize: '12px' }} onClick={printPDF}>🖨 PDF</button>
          <button className="btn btn-secondary" style={{ fontSize: '12px' }} onClick={() => nav({ name: 'invoice-edit', id: inv.id })}>Edit</button>
          <button className="btn btn-danger" style={{ fontSize: '12px' }} onClick={del}>Delete</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div className="card">
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Bill To</div>
          <div style={{ fontWeight: 600 }}>{inv.client_name}</div>
          {inv.client_company && <div style={{ color: '#64748b', fontSize: '13px' }}>{inv.client_company}</div>}
          {inv.client_email && <div style={{ color: '#64748b', fontSize: '13px' }}>{inv.client_email}</div>}
        </div>
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>ISSUE</div><div style={{ marginTop: '3px', fontWeight: 500 }}>{formatDate(inv.issue_date)}</div></div>
            <div><div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>DUE</div><div style={{ marginTop: '3px', fontWeight: 500 }}>{formatDate(inv.due_date)}</div></div>
            <div><div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>TOTAL</div><div style={{ marginTop: '3px', fontWeight: 700, fontSize: '17px' }}>{fmt(inv.total)}</div></div>
            <div><div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>BALANCE</div><div style={{ marginTop: '3px', fontWeight: 700, fontSize: '17px', color: balance > 0 ? '#ef4444' : '#22c55e' }}>{fmt(balance)}</div></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '12px' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '10px' }}>Line Items</h3>
        <table>
          <thead><tr><th>Description</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Unit Price</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
          <tbody>
            {(inv.items || []).map((item, i) => (
              <tr key={i}><td>{item.description}</td><td style={{ textAlign: 'right' }}>{item.quantity}</td><td style={{ textAlign: 'right' }}>{fmt(Number(item.unit_price))}</td><td style={{ textAlign: 'right', fontWeight: 500 }}>{fmt(Number(item.amount))}</td></tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '12px', marginLeft: 'auto', width: '200px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '4px' }}><span>Subtotal</span><span>{fmt(Number(inv.subtotal))}</span></div>
          {Number(inv.discount) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '4px' }}><span>Discount</span><span>-{fmt(Number(inv.discount))}</span></div>}
          {Number(inv.tax_rate) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '4px' }}><span>Tax ({inv.tax_rate}%)</span><span>{fmt(Number(inv.tax_amount))}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', borderTop: '2px solid #e2e8f0', paddingTop: '8px' }}><span>Total</span><span>{fmt(Number(inv.total))}</span></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontWeight: 600 }}>Payments</h3>
          {inv.status !== 'paid' && <button className="btn btn-primary" style={{ fontSize: '12px' }} onClick={() => setPayVisible(v => !v)}>+ Record Payment</button>}
        </div>
        {payVisible && (
          <form onSubmit={addPayment} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '10px' }}>
            <div className="form-row"><label className="label">Amount</label><input className="input" type="number" min="0" step="any" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} required /></div>
            <div className="form-row"><label className="label">Date</label><input className="input" type="date" value={payForm.payment_date} onChange={e => setPayForm(f => ({ ...f, payment_date: e.target.value }))} /></div>
            <div className="form-row"><label className="label">Method</label>
              <select className="input" value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}>
                {['bank','cash','card','mobile_money','cheque','other'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-row"><label className="label">Reference</label><input className="input" value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <button type="submit" className="btn btn-primary" disabled={payLoading} style={{ flex: 1 }}>{payLoading ? '…' : 'Save'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setPayVisible(false)}>Cancel</button>
            </div>
          </form>
        )}
        {(inv.payments || []).length === 0
          ? <div style={{ color: '#94a3b8', fontSize: '13px' }}>No payments yet.</div>
          : <table><thead><tr><th>Date</th><th>Method</th><th>Reference</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead><tbody>
            {(inv.payments || []).map(p => (
              <tr key={p.id}><td>{formatDate(p.payment_date)}</td><td style={{ textTransform: 'capitalize' }}>{(p.method || '').replace('_', ' ')}</td><td>{p.reference || '—'}</td><td style={{ textAlign: 'right', fontWeight: 600, color: '#22c55e' }}>{fmt(Number(p.amount))}</td></tr>
            ))}
          </tbody></table>
        }
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: '10px' }}>Actions</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {inv.status === 'draft' && <button className="btn btn-primary" onClick={() => markStatus('sent')}>Mark as Sent</button>}
          {inv.status === 'sent' && <button className="btn" style={{ background: '#f0fdf4', color: '#22c55e', border: '1px solid #bbf7d0' }} onClick={() => markStatus('paid')}>Mark as Paid</button>}
          {['draft','sent','overdue'].includes(inv.status) && <button className="btn btn-secondary" onClick={() => markStatus('cancelled')}>Cancel Invoice</button>}
        </div>
      </div>
    </>
  )
}
