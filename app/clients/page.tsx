'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import { apiFetch } from '@/lib/auth'
import type { Client } from '@/types'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiFetch('/api/clients').then(r => r.json()).then(setClients).finally(() => setLoading(false))
  }, [])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(search.toLowerCase())
  )

  const del = async (id: number) => {
    if (!confirm('Delete this client?')) return
    await apiFetch(`/api/clients/${id}`, { method: 'DELETE' })
    setClients(c => c.filter(x => x.id !== id))
  }

  return (
    <AppShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Clients</h1>
        <Link href="/clients/create" className="btn btn-primary">+ New Client</Link>
      </div>
      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" style={{ maxWidth: '320px' }} />
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
        ) : (
          <table>
            <thead>
              <tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  {search ? 'No clients match your search' : 'No clients yet — add one!'}
                </td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><Link href={`/clients/${c.id}`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>{c.name}</Link></td>
                  <td>{c.company || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/clients/${c.id}`} className="btn btn-ghost" style={{ fontSize: '13px' }}>Edit</Link>
                    <button onClick={() => del(c.id)} className="btn btn-danger" style={{ fontSize: '13px', marginLeft: '8px' }}>Delete</button>
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
