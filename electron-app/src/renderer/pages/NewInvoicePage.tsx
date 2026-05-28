import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Page } from '../App'

interface Client { id: number; name: string; company: string }
interface Item { description: string; quantity: number; unit_price: number; amount: number }
const emptyItem = (): Item => ({ description: '', quantity: 1, unit_price: 0, amount: 0 })

export default function NewInvoicePage({ nav }: { nav: (p: Page) => void }) {
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState({ client_id: '', status: 'draft', issue_date: new Date().toISOString().split('T')[0], due_date: '', notes: '', tax_rate: '0', discount: '0', currency: 'USD', invoice_number: '' })
  const [items, setItems] = useState<Item[]>([emptyItem()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { api('/api/clients').then(r => r.json()).then(setClients) }, [])

  const s = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setItem = (i: number, k: keyof Item, v: string) => setItems(items => items.map((item, idx) => { if (idx !== i) return item; const u = { ...item, [k]: k === 'description' ? v : Number(v) }; u.amount = u.quantity * u.unit_price; return u }))
  const addItem = () => setItems(i => [...i, emptyItem()])
  const removeItem = (i: number) => setItems(items => items.filter((_, idx) => idx !== i))

  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const discAmt = Number(form.discount)
  const taxAmt = (subtotal - discAmt) * (Number(form.tax_rate) / 100)
  const total = (subtotal - discAmt) + taxAmt
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 })

  const submit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault(); setSaving(true); setError('')
    const body = { ...form, client_id: Number(form.client_id), tax_rate: Number(form.tax_rate), discount: Number(form.discount), status: asDraft ? 'draft' : form.status, items }
    const res = await api('/api/invoices', { method: 'POST', body: JSON.stringify(body) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Error'); return }
    nav({ name: 'invoice', id: data.id })
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={() => nav({ name: 'invoices' })}>←</button>
          <h1 className="page-title">New Invoice</h1>
        </div>
      </div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>Details</h3>
          <div className="form-grid">
            <div className="form-row"><label className="label">Client *</label>
              <select className="input" value={form.client_id} onChange={s('client_id')} required>
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
              </select>
            </div>
            <div className="form-row"><label className="label">Invoice #</label><input className="input" value={form.invoice_number} onChange={s('invoice_number')} placeholder="Auto" /></div>
            <div className="form-row"><label className="label">Status</label>
              <select className="input" value={form.status} onChange={s('status')}>
                {['draft','sent','paid'].map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase()+st.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-row"><label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={s('currency')}>
                {['USD','EUR','GBP','GHS','NGN','CAD','AUD'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-row"><label className="label">Issue Date</label><input className="input" type="date" value={form.issue_date} onChange={s('issue_date')} required /></div>
            <div className="form-row"><label className="label">Due Date</label><input className="input" type="date" value={form.due_date} onChange={s('due_date')} /></div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>Line Items</h3>
          <table style={{ marginBottom: '10px' }}>
            <thead><tr><th>Description</th><th style={{ textAlign: 'right', width: '80px' }}>Qty</th><th style={{ textAlign: 'right', width: '120px' }}>Price</th><th style={{ textAlign: 'right', width: '100px' }}>Amount</th><th style={{ width: '40px' }}></th></tr></thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: 'none' }}>
                  <td style={{ padding: '6px 10px' }}><input className="input" value={item.description} onChange={e => setItem(i, 'description', e.target.value)} placeholder="Description…" required /></td>
                  <td style={{ padding: '6px 10px' }}><input className="input" type="number" min="0" step="any" value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} style={{ textAlign: 'right' }} /></td>
                  <td style={{ padding: '6px 10px' }}><input className="input" type="number" min="0" step="any" value={item.unit_price} onChange={e => setItem(i, 'unit_price', e.target.value)} style={{ textAlign: 'right' }} /></td>
                  <td style={{ textAlign: 'right', fontWeight: 500, padding: '6px 10px' }}>{fmt(item.amount)}</td>
                  <td style={{ padding: '6px 10px' }}><button type="button" className="btn btn-ghost" style={{ padding: '3px 7px', color: '#ef4444' }} onClick={() => removeItem(i)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn btn-secondary" style={{ fontSize: '12px' }} onClick={addItem}>+ Add Line</button>
          <div style={{ marginTop: '16px', marginLeft: 'auto', width: '220px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '6px' }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#64748b' }}>
              <span style={{ flex: 1 }}>Discount</span>
              <input className="input" type="number" min="0" step="any" value={form.discount} onChange={s('discount')} style={{ width: '80px', textAlign: 'right', fontSize: '12px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#64748b' }}>
              <span style={{ flex: 1 }}>Tax %</span>
              <input className="input" type="number" min="0" max="100" step="any" value={form.tax_rate} onChange={s('tax_rate')} style={{ width: '80px', textAlign: 'right', fontSize: '12px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', borderTop: '2px solid #e2e8f0', paddingTop: '8px' }}>
              <span>Total</span><span>{form.currency} {fmt(total)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <label className="label">Notes</label>
          <textarea className="input" value={form.notes} onChange={s('notes')} rows={2} placeholder="Payment terms, bank details…" style={{ resize: 'vertical' }} />
        </div>

        {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => nav({ name: 'invoices' })}>Cancel</button>
          <button type="button" className="btn btn-secondary" disabled={saving} onClick={e => submit(e as React.FormEvent, true)}>Save Draft</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create Invoice'}</button>
        </div>
      </form>
    </>
  )
}
