'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/auth'
import type { Client, InvoiceItem, Invoice } from '@/types'

interface Props {
  initial?: Partial<Invoice>
  editId?: number
}

const empty = (): InvoiceItem => ({ description: '', quantity: 1, unit_price: 0, amount: 0 })

export default function InvoiceForm({ initial, editId }: Props) {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState({
    client_id: initial?.client_id ? String(initial.client_id) : '',
    invoice_number: initial?.invoice_number || '',
    status: initial?.status || 'draft',
    issue_date: initial?.issue_date || new Date().toISOString().split('T')[0],
    due_date: initial?.due_date || '',
    notes: initial?.notes || '',
    tax_rate: String(initial?.tax_rate ?? 0),
    discount: String(initial?.discount ?? 0),
    currency: initial?.currency || 'USD',
  })
  const [items, setItems] = useState<InvoiceItem[]>(initial?.items?.length ? initial.items : [empty()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const setItem = (i: number, k: keyof InvoiceItem, v: string) => {
    setItems(items => items.map((item, idx) => {
      if (idx !== i) return item
      const updated = { ...item, [k]: k === 'description' ? v : Number(v) }
      updated.amount = Number(updated.quantity) * Number(updated.unit_price)
      return updated
    }))
  }

  const addItem = () => setItems(items => [...items, empty()])
  const removeItem = (i: number) => setItems(items => items.filter((_, idx) => idx !== i))

  const subtotal = items.reduce((s, i) => s + Number(i.amount), 0)
  const discountAmt = Number(form.discount)
  const taxableAmount = subtotal - discountAmt
  const taxAmount = taxableAmount * (Number(form.tax_rate) / 100)
  const total = taxableAmount + taxAmount

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const submit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const body = { ...form, client_id: Number(form.client_id), tax_rate: Number(form.tax_rate), discount: Number(form.discount), status: asDraft ? 'draft' : form.status, items }
    const url = editId ? `/api/invoices/${editId}` : '/api/invoices'
    const method = editId ? 'PUT' : 'POST'
    const res = await apiFetch(url, { method, body: JSON.stringify(body) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Error saving invoice'); return }
    router.push(`/invoices/${data.id || editId}`)
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#475569' }}>Invoice Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label className="label">Client *</label>
            <select className="input" value={form.client_id} onChange={set('client_id')} required>
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Invoice Number</label>
            <input className="input" value={form.invoice_number} onChange={set('invoice_number')} placeholder="Auto-generated" />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              {['draft','sent','paid','overdue','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input" value={form.currency} onChange={set('currency')}>
              {['USD','EUR','GBP','GHS','NGN','CAD','AUD'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Issue Date</label>
            <input className="input" type="date" value={form.issue_date} onChange={set('issue_date')} required />
          </div>
          <div>
            <label className="label">Due Date</label>
            <input className="input" type="date" value={form.due_date} onChange={set('due_date')} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#475569' }}>Line Items</h3>
        <table style={{ marginBottom: '12px' }}>
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Description</th>
              <th style={{ width: '12%', textAlign: 'right' }}>Qty</th>
              <th style={{ width: '18%', textAlign: 'right' }}>Unit Price</th>
              <th style={{ width: '18%', textAlign: 'right' }}>Amount</th>
              <th style={{ width: '7%' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: 'none' }}>
                <td style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                  <input className="input" value={item.description} onChange={e => setItem(i, 'description', e.target.value)} placeholder="Description…" required />
                </td>
                <td style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                  <input className="input" type="number" min="0" step="any" value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} style={{ textAlign: 'right' }} />
                </td>
                <td style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                  <input className="input" type="number" min="0" step="any" value={item.unit_price} onChange={e => setItem(i, 'unit_price', e.target.value)} style={{ textAlign: 'right' }} />
                </td>
                <td style={{ textAlign: 'right', fontWeight: 500, paddingTop: '8px', paddingBottom: '8px' }}>
                  {fmt(Number(item.amount))}
                </td>
                <td style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                  <button type="button" onClick={() => removeItem(i)} className="btn btn-ghost" style={{ padding: '4px 8px', color: '#ef4444', fontSize: '16px' }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addItem} className="btn btn-secondary" style={{ fontSize: '13px' }}>+ Add Line</button>

        <div style={{ marginTop: '20px', marginLeft: 'auto', width: '260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
            <span>Subtotal</span><span>{fmt(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b' }}>
            <span style={{ flex: 1 }}>Discount</span>
            <input className="input" type="number" min="0" step="any" value={form.discount} onChange={set('discount')} style={{ width: '90px', textAlign: 'right', fontSize: '13px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b' }}>
            <span style={{ flex: 1 }}>Tax %</span>
            <input className="input" type="number" min="0" max="100" step="any" value={form.tax_rate} onChange={set('tax_rate')} style={{ width: '90px', textAlign: 'right', fontSize: '13px' }} />
          </div>
          {Number(form.tax_rate) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
              <span>Tax ({form.tax_rate}%)</span><span>{fmt(taxAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, borderTop: '2px solid #e2e8f0', paddingTop: '10px', color: '#1e293b' }}>
            <span>Total</span><span>{form.currency} {fmt(total)}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <label className="label">Notes / Payment Instructions</label>
        <textarea className="input" value={form.notes} onChange={set('notes')} rows={3} placeholder="Payment terms, bank details, thank you note…" style={{ resize: 'vertical' }} />
      </div>

      {error && <div style={{ color: '#ef4444', fontSize: '14px', padding: '10px 14px', background: '#fef2f2', borderRadius: '8px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancel</button>
        <button type="button" onClick={e => submit(e as React.FormEvent, true)} className="btn btn-secondary" disabled={saving}>Save Draft</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Invoice'}</button>
      </div>
    </form>
  )
}
