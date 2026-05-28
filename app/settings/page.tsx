'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import { apiFetch } from '@/lib/auth'

export default function SettingsPage() {
  const [form, setForm] = useState({ name: '', company_name: '', company_address: '', company_phone: '', currency: 'USD', email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    apiFetch('/api/auth/me').then(r => r.json()).then(u => {
      setForm({ name: u.name || '', company_name: u.company_name || '', company_address: u.company_address || '', company_phone: u.company_phone || '', currency: u.currency || 'USD', email: u.email || '' })
    }).finally(() => setLoading(false))
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await apiFetch('/api/auth/me', { method: 'PUT', body: JSON.stringify(form) })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <AppShell><div style={{ color: '#94a3b8', paddingTop: '40px' }}>Loading…</div></AppShell>

  return (
    <AppShell>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '28px' }}>Settings</h1>
      <div style={{ maxWidth: '600px' }}>
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Business Profile</h2>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Your Name</label>
                <input className="input" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" value={form.email} disabled style={{ background: '#f8fafc', cursor: 'not-allowed' }} />
              </div>
              <div>
                <label className="label">Company Name</label>
                <input className="input" value={form.company_name} onChange={set('company_name')} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.company_phone} onChange={set('company_phone')} />
              </div>
              <div>
                <label className="label">Default Currency</label>
                <select className="input" value={form.currency} onChange={set('currency')}>
                  {['USD','EUR','GBP','GHS','NGN','CAD','AUD','ZAR'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Company Address</label>
              <textarea className="input" value={form.company_address} onChange={set('company_address')} rows={2} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              {saved && <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: 500 }}>Saved!</span>}
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
