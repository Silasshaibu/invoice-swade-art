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
        <h1 style={{ fontSize: '22px', fontWeight: 500 }}>Clients</h1>
        <Link href="/clients/create" className="btn btn-primary">+ New Client</Link>
      </div>
      <div className="card" style={{ padding: '0', width: '100%' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', width: '100%' }}>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" style={{ maxWidth: '100%', width: '100%' }} />
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', width: '100%' }}>Loading…</div>
        ) : (
          <div className="table-scroll" style={{ width: '100%' }}><table style={{ width: '100%' }}>
            <thead>
              <tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  {search ? 'No clients match your search' : 'No clients yet — add one!'}
                </td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><Link href={`/clients/${c.id}`} style={{ color: '#111827', textDecoration: 'none', fontWeight: 500 }}>{c.name}</Link></td>
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
          </table></div>
        )}
      </div>
    </AppShell>
  )
}
