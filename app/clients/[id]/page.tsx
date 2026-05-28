'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { apiFetch } from '@/lib/auth'
import type { Client } from '@/types'

export default function EditClientPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState<Partial<Client>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch(`/api/clients/${id}`).then(r => r.json()).then(setForm).finally(() => setLoading(false))
  }, [id])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await apiFetch(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Error'); return }
    router.push('/clients')
  }

  if (loading) return <AppShell><div style={{ color: '#94a3b8' }}>Loading…</div></AppShell>

  return (
    <AppShell>
      <div style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => router.back()} className="btn btn-ghost" style={{ fontSize: '18px', padding: '6px 10px' }}>←</button>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Edit Client</h1>
        </div>
        <div className="card">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Name *</label>
                <input className="input" value={form.name || ''} onChange={set('name')} required />
              </div>
              <div>
                <label className="label">Company</label>
                <input className="input" value={form.company || ''} onChange={set('company')} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email || ''} onChange={set('email')} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone || ''} onChange={set('phone')} />
              </div>
              <div>
                <label className="label">Tax ID / VAT</label>
                <input className="input" value={form.tax_id || ''} onChange={set('tax_id')} />
              </div>
            </div>
            <div>
              <label className="label">Address</label>
              <textarea className="input" value={form.address || ''} onChange={set('address')} rows={2} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input" value={form.notes || ''} onChange={set('notes')} rows={2} style={{ resize: 'vertical' }} />
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
