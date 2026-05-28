'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import { apiFetch } from '@/lib/auth'
import type { Invoice, Payment } from '@/types'

const STATUS_BADGE: Record<string, string> = {
  draft: 'badge-draft', sent: 'badge-sent', paid: 'badge-paid', overdue: 'badge-overdue', cancelled: 'badge-cancelled',
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [inv, setInv] = useState<(Invoice & { payments?: Payment[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [payForm, setPayForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], method: 'bank', reference: '', notes: '' })
  const [payVisible, setPayVisible] = useState(false)
  const [payLoading, setPayLoading] = useState(false)

  const load = () => {
    setLoading(true)
    apiFetch(`/api/invoices/${id}`).then(r => r.json()).then(setInv).finally(() => setLoading(false))
  }
  useEffect(load, [id])

  const del = async () => {
    if (!confirm('Delete this invoice?')) return
    await apiFetch(`/api/invoices/${id}`, { method: 'DELETE' })
    router.push('/invoices')
  }

  const markStatus = async (status: string) => {
    await apiFetch(`/api/invoices/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
    load()
  }

  const printPDF = () => window.open(`/api/invoices/${id}/pdf`, '_blank')

  const addPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setPayLoading(true)
    await apiFetch(`/api/invoices/${id}/payments`, { method: 'POST', body: JSON.stringify({ ...payForm, amount: Number(payForm.amount) }) })
    setPayLoading(false)
    setPayVisible(false)
    load()
  }

  const fmt = (n: number) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  if (loading) return <AppShell><div style={{ color: '#94a3b8', paddingTop: '40px' }}>Loading…</div></AppShell>
  if (!inv) return <AppShell><div>Invoice not found</div></AppShell>

  const totalPaid = (inv.payments || []).reduce((s, p) => s + Number(p.amount), 0)
  const balance = Number(inv.total) - totalPaid

  return (
    <AppShell>
      <div style={{ maxWidth: '860px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => router.back()} className="btn btn-ghost" style={{ fontSize: '18px', padding: '6px 10px' }}>←</button>
          <h1 style={{ fontSize: '22px', fontWeight: 700, flex: 1 }}>{inv.invoice_number}</h1>
          <span className={`badge ${STATUS_BADGE[inv.status]}`} style={{ fontSize: '13px', padding: '4px 12px' }}>{inv.status}</span>
          <button onClick={printPDF} className="btn btn-secondary" style={{ fontSize: '13px' }}>🖨 Print / PDF</button>
          <Link href={`/invoices/${id}/edit`} className="btn btn-secondary" style={{ fontSize: '13px' }}>Edit</Link>
          <button onClick={del} className="btn btn-danger" style={{ fontSize: '13px' }}>Delete</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="card">
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bill To</div>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>{inv.client_name}</div>
            {inv.client_company && <div style={{ color: '#64748b', fontSize: '13px' }}>{inv.client_company}</div>}
            {inv.client_email && <div style={{ color: '#64748b', fontSize: '13px' }}>{inv.client_email}</div>}
          </div>
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>ISSUE DATE</div><div style={{ fontWeight: 500, marginTop: '4px' }}>{inv.issue_date}</div></div>
              <div><div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>DUE DATE</div><div style={{ fontWeight: 500, marginTop: '4px', color: inv.status === 'overdue' ? '#ef4444' : 'inherit' }}>{inv.due_date || '—'}</div></div>
              <div><div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>TOTAL</div><div style={{ fontWeight: 700, fontSize: '18px', marginTop: '4px', color: '#1e293b' }}>{fmt(inv.total)}</div></div>
              <div><div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>BALANCE</div><div style={{ fontWeight: 700, fontSize: '18px', marginTop: '4px', color: balance > 0 ? '#ef4444' : '#22c55e' }}>{fmt(balance)}</div></div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>Line Items</h3>
          <table>
            <thead><tr><th>Description</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Unit Price</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
            <tbody>
              {(inv.items || []).map((item, i) => (
                <tr key={i}>
                  <td>{item.description}</td>
                  <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(Number(item.unit_price))}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>{fmt(Number(item.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '16px', marginLeft: 'auto', width: '220px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>Subtotal</span><span>{fmt(Number(inv.subtotal))}</span></div>
            {Number(inv.discount) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>Discount</span><span>-{fmt(Number(inv.discount))}</span></div>}
            {Number(inv.tax_rate) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>Tax ({inv.tax_rate}%)</span><span>{fmt(Number(inv.tax_amount))}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '17px', borderTop: '2px solid #e2e8f0', paddingTop: '8px' }}><span>Total</span><span>{fmt(Number(inv.total))}</span></div>
          </div>
        </div>

        {inv.notes && (
          <div className="card" style={{ marginBottom: '16px', background: '#f8fafc' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
            <p style={{ fontSize: '14px', color: '#64748b', whiteSpace: 'pre-wrap' }}>{inv.notes}</p>
          </div>
        )}

        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontWeight: 600 }}>Payments</h3>
            {inv.status !== 'paid' && (
              <button onClick={() => setPayVisible(v => !v)} className="btn btn-primary" style={{ fontSize: '13px' }}>+ Record Payment</button>
            )}
          </div>
          {payVisible && (
            <form onSubmit={addPayment} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '12px' }}>
              <div><label className="label">Amount</label><input className="input" type="number" min="0" step="any" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} required /></div>
              <div><label className="label">Date</label><input className="input" type="date" value={payForm.payment_date} onChange={e => setPayForm(f => ({ ...f, payment_date: e.target.value }))} required /></div>
              <div><label className="label">Method</label>
                <select className="input" value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}>
                  {['bank','cash','card','mobile_money','cheque','other'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div><label className="label">Reference</label><input className="input" value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} /></div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <button type="submit" className="btn btn-primary" disabled={payLoading} style={{ flex: 1 }}>{payLoading ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={() => setPayVisible(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          )}
          {(inv.payments || []).length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>No payments recorded yet.</div>
          ) : (
            <table>
              <thead><tr><th>Date</th><th>Method</th><th>Reference</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {(inv.payments || []).map(p => (
                  <tr key={p.id}>
                    <td>{p.payment_date}</td>
                    <td style={{ textTransform: 'capitalize' }}>{(p.method || '').replace('_', ' ')}</td>
                    <td>{p.reference || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#22c55e' }}>{fmt(Number(p.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>Actions</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {inv.status === 'draft' && <button onClick={() => markStatus('sent')} className="btn btn-primary">Mark as Sent</button>}
            {inv.status === 'sent' && <button onClick={() => markStatus('paid')} className="btn" style={{ background: '#f0fdf4', color: '#22c55e', border: '1px solid #bbf7d0' }}>Mark as Paid</button>}
            {['draft','sent','overdue'].includes(inv.status) && <button onClick={() => markStatus('cancelled')} className="btn btn-secondary">Cancel Invoice</button>}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
