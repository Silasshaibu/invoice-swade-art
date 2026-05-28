import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Page } from '../App'

interface Client { id: number; name: string; email: string; phone: string; company: string; address: string; tax_id: string; notes: string }

export default function ClientsPage({ nav: _nav }: { nav: (p: Page) => void }) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', company: '', tax_id: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const load = () => { setLoading(true); api('/api/clients').then(r => r.json()).then(setClients).finally(() => setLoading(false)) }
  useEffect(load, [])

  const openNew = () => { setEditId(0); setForm({ name: '', email: '', phone: '', address: '', company: '', tax_id: '', notes: '' }) }
  const openEdit = (c: Client) => { setEditId(c.id); setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, company: c.company, tax_id: c.tax_id, notes: c.notes }) }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    if (editId === 0) {
      await api('/api/clients', { method: 'POST', body: JSON.stringify(form) })
    } else {
      await api(`/api/clients/${editId}`, { method: 'PUT', body: JSON.stringify(form) })
    }
    setSaving(false); setEditId(null); load()
  }

  const del = async (id: number) => {
    if (!confirm('Delete this client?')) return
    await api(`/api/clients/${id}`, { method: 'DELETE' })
    load()
  }

  const s = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase()))

  if (editId !== null) return (
    <>
      <div className="page-header">
        <h1 className="page-title">{editId === 0 ? 'New Client' : 'Edit Client'}</h1>
        <button className="btn btn-secondary" onClick={() => setEditId(null)}>← Back</button>
      </div>
      <div className="card" style={{ maxWidth: '560px' }}>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-grid">
            <div className="form-row"><label className="label">Name *</label><input className="input" value={form.name} onChange={s('name')} required /></div>
            <div className="form-row"><label className="label">Company</label><input className="input" value={form.company} onChange={s('company')} /></div>
            <div className="form-row"><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={s('email')} /></div>
            <div className="form-row"><label className="label">Phone</label><input className="input" value={form.phone} onChange={s('phone')} /></div>
            <div className="form-row"><label className="label">Tax ID</label><input className="input" value={form.tax_id} onChange={s('tax_id')} /></div>
          </div>
          <div className="form-row"><label className="label">Address</label><textarea className="input" value={form.address} onChange={s('address')} rows={2} /></div>
          <div className="form-row"><label className="label">Notes</label><textarea className="input" value={form.notes} onChange={s('notes')} rows={2} /></div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </>
  )

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Clients</h1>
        <button className="btn btn-primary" onClick={openNew}>+ New Client</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ maxWidth: '280px' }} />
        </div>
        {loading ? <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div> : (
          <table>
            <thead><tr><th>Name</th><th>Company</th><th>Email</th><th></th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No clients</td></tr>}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.company || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn btn-danger" style={{ fontSize: '12px', marginLeft: '6px' }} onClick={() => del(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
