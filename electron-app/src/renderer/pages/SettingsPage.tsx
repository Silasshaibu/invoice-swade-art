import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function SettingsPage() {
  const [form, setForm] = useState({ name: '', company_name: '', company_address: '', company_phone: '', currency: 'USD', email: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api('/api/auth/me').then(r => r.json()).then(u => {
      setForm({ name: u.name || '', company_name: u.company_name || '', company_address: u.company_address || '', company_phone: u.company_phone || '', currency: u.currency || 'USD', email: u.email || '' })
    }).finally(() => setLoading(false))
  }, [])

  const s = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    await api('/api/auth/me', { method: 'PUT', body: JSON.stringify(form) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div style={{ color: '#94a3b8', paddingTop: '40px' }}>Loading…</div>

  return (
    <>
      <div className="page-header"><h1 className="page-title">Settings</h1></div>
      <div className="card" style={{ maxWidth: '560px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Business Profile</h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-grid">
            <div className="form-row"><label className="label">Name</label><input className="input" value={form.name} onChange={s('name')} required /></div>
            <div className="form-row"><label className="label">Email</label><input className="input" value={form.email} disabled style={{ background: '#f8fafc', cursor: 'not-allowed' }} /></div>
            <div className="form-row"><label className="label">Company Name</label><input className="input" value={form.company_name} onChange={s('company_name')} /></div>
            <div className="form-row"><label className="label">Phone</label><input className="input" value={form.company_phone} onChange={s('company_phone')} /></div>
            <div className="form-row"><label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={s('currency')}>
                {['USD','EUR','GBP','GHS','NGN','CAD','AUD','ZAR'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row"><label className="label">Address</label><textarea className="input" value={form.company_address} onChange={s('company_address')} rows={2} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            {saved && <span style={{ color: '#22c55e', fontSize: '13px', fontWeight: 500 }}>Saved!</span>}
          </div>
        </form>
      </div>
    </>
  )
}
