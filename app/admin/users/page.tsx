'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { apiFetch, getUser } from '@/lib/auth'
import type { AuthUser } from '@/types'
import { Shield, Trash2, UserPlus, UserCheck, AlertTriangle, Clock, X } from 'lucide-react'

interface AdminUserRow {
  id: number
  email: string
  name: string
  is_admin: boolean
  created_at: string
  client_count: number
  invoice_count: number
}

interface AccessRequestRow {
  id: number
  name: string
  email: string
  status: string
  requested_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [accessRequests, setAccessRequests] = useState<AccessRequestRow[]>([])
  const [arActionLoading, setArActionLoading] = useState<number | null>(null)

  const load = async () => {
    try {
      const res = await apiFetch('/api/admin/users')
      if (!res.ok) {
        if (res.status === 403) {
          setError('Access Denied: You must be an administrator.')
          setLoading(false)
          return
        }
        throw new Error('Failed to fetch users')
      }
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadAccessRequests = async () => {
    try {
      const res = await apiFetch('/api/admin/access-requests')
      if (!res.ok) return
      const data = await res.json()
      setAccessRequests(Array.isArray(data) ? data : [])
    } catch {}
  }

  useEffect(() => {
    const loggedUser = getUser()
    setCurrentUser(loggedUser)
    if (!loggedUser || !loggedUser.isAdmin) {
      router.replace('/dashboard')
      return
    }
    load()
    loadAccessRequests()
  }, [router])

  const decideAccessRequest = async (id: number, decision: 'approved' | 'rejected') => {
    setError(null)
    setArActionLoading(id)
    try {
      const res = await apiFetch('/api/admin/access-requests', {
        method: 'PUT',
        body: JSON.stringify({ id, decision })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update request')
      }
      await loadAccessRequests()
    } catch (err: any) {
      setError(err.message || 'Error updating access request')
    } finally {
      setArActionLoading(null)
    }
  }

  const toggleAdmin = async (userId: number, currentIsAdmin: boolean) => {
    if (userId === currentUser?.id) return
    setError(null)
    setActionLoading(userId)
    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'PUT',
        body: JSON.stringify({ userId, isAdmin: !currentIsAdmin })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update user role')
      }
      // Reload user list to reflect changes
      await load()
    } catch (err: any) {
      setError(err.message || 'Error updating user role')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId: number) => {
    if (userId === currentUser?.id) return
    setError(null)
    setActionLoading(userId)
    setConfirmDeleteId(null)
    try {
      const res = await apiFetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete user')
      }
      // Reload user list
      await load()
    } catch (err: any) {
      setError(err.message || 'Error deleting user')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.is_admin).length,
    clients: users.reduce((s, u) => s + (u.client_count || 0), 0),
    invoices: users.reduce((s, u) => s + (u.invoice_count || 0), 0),
  }

  if (loading) return <AppShell><div style={{ color: '#94a3b8', paddingTop: '40px' }}>Loading Admin Panel…</div></AppShell>
  if (error && !users.length) return <AppShell><div style={{ color: '#ef4444', paddingTop: '40px' }}>{error}</div></AppShell>

  return (
    <AppShell>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#030213', margin: 0 }}>User Administration</h1>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>System-wide user accounts and resource overview</p>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#ef4444', background: '#fef2f2', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Pending Access Requests */}
        {accessRequests.length > 0 && (
          <div className="card" style={{ padding: 0, marginBottom: '28px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#f59e0b" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>Pending Access Requests ({accessRequests.length})</h3>
            </div>
            <div className="table-scroll">
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Requester</th>
                    <th>Requested</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accessRequests.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{r.name}</div>
                        <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{r.email}</div>
                      </td>
                      <td style={{ fontSize: '13px', color: '#6b7280' }}>
                        {new Date(r.requested_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            onClick={() => decideAccessRequest(r.id, 'approved')}
                            className="btn btn-ghost"
                            disabled={arActionLoading === r.id}
                            style={{ padding: '6px 10px', fontSize: '12px', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <UserCheck size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => decideAccessRequest(r.id, 'rejected')}
                            className="btn btn-ghost"
                            disabled={arActionLoading === r.id}
                            style={{ padding: '6px 10px', fontSize: '12px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Metrics Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="card">
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginBottom: '6px' }}>Total Registered Users</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#030213' }}>{stats.totalUsers}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginBottom: '6px' }}>Administrators</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#6366f1' }}>{stats.admins}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginBottom: '6px' }}>Total Clients Saved</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>{stats.clients}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginBottom: '6px' }}>Total Invoices Drafted</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>{stats.invoices}</div>
          </div>
        </div>

        {/* User List Panel */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>System Accounts</h3>
            <input
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{ maxWidth: '280px', width: '100%', fontSize: '13px' }}
            />
          </div>

          <div className="table-scroll">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'center' }}>Clients</th>
                  <th style={{ textAlign: 'center' }}>Invoices</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      No user accounts found matching query.
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => {
                    const isSelf = u.id === currentUser?.id
                    const initial = (u.name || u.email || 'U').charAt(0).toUpperCase()
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        {/* User Profile */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              backgroundColor: isSelf ? '#e0e7ff' : '#f3f4f6',
                              color: isSelf ? '#4f46e5' : '#4b5563',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 600, fontSize: '14px'
                            }}>
                              {initial}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {u.name || 'Anonymous User'}
                                {isSelf && <span style={{ fontSize: '10px', background: '#e0e7ff', color: '#4f46e5', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>You</span>}
                              </div>
                              <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Admin Badge */}
                        <td>
                          {u.is_admin ? (
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Shield size={10} /> Admin
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '12px' }}>
                              User
                            </span>
                          )}
                        </td>

                        {/* Registered date */}
                        <td style={{ fontSize: '13px', color: '#6b7280' }}>
                          {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>

                        {/* Resource stats */}
                        <td style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                          {u.client_count}
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                          {u.invoice_count}
                        </td>

                        {/* Actions */}
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {/* Toggle role */}
                            <button
                              onClick={() => toggleAdmin(u.id, u.is_admin)}
                              className="btn btn-ghost"
                              disabled={isSelf || actionLoading === u.id}
                              style={{
                                padding: '6px 10px', fontSize: '12px',
                                color: u.is_admin ? '#ef4444' : '#4f46e5',
                                display: 'flex', alignItems: 'center', gap: '4px'
                              }}
                              title={isSelf ? 'You cannot change your own admin status' : u.is_admin ? 'Demote user to normal account' : 'Elevate user to administrator'}
                            >
                              {u.is_admin ? <UserPlus size={14} /> : <UserCheck size={14} />}
                              {u.is_admin ? 'Demote' : 'Make Admin'}
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => setConfirmDeleteId(u.id)}
                              className="btn btn-ghost"
                              disabled={isSelf || actionLoading === u.id}
                              style={{
                                padding: '6px 10px', fontSize: '12px',
                                color: isSelf ? '#9ca3af' : '#dc2626',
                                display: 'flex', alignItems: 'center', gap: '4px'
                              }}
                              title={isSelf ? 'You cannot delete your own account' : 'Permantly delete user and all assets'}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {confirmDeleteId && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '50%'
                }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>Delete User Account?</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '6px', lineHeight: 1.5 }}>
                    This action is **irreversible**. Deleting this user will immediately delete their profile, and cascade to delete all client records, invoices, line items, and payments.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="btn btn-danger"
                  style={{ fontSize: '13px' }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
