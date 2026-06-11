'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearAuth, getUser } from '@/lib/auth'
import { LayoutDashboard, FileText, Users, BarChart2, CreditCard, Settings, LogOut, X, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AuthUser } from '@/types'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const logout = async () => {
    try {
      const token = localStorage.getItem('inv_token')
      await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    } catch {}
    clearAuth()
    router.push('/login')
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ padding: '24px', borderBottom: '1px solid #d1d5db', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#030213' }}>Invoice</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>swade-art.com</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '9px 12px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '14px', fontWeight: active ? 500 : 400,
                background: active ? '#e5e7eb' : 'transparent',
                color: active ? '#111827' : '#4b5563',
                transition: 'all 0.15s',
              }}>
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
        {user?.isAdmin && (
          <Link
            href="/admin/users"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '9px 12px', borderRadius: '8px', textDecoration: 'none',
              fontSize: '14px', fontWeight: pathname.startsWith('/admin') ? 500 : 400,
              background: pathname.startsWith('/admin') ? '#e5e7eb' : 'transparent',
              color: pathname.startsWith('/admin') ? '#111827' : '#4b5563',
              transition: 'all 0.15s',
            }}>
            <Shield size={16} />
            Admin Users
          </Link>
        )}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid #d1d5db' }}>
        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name || user?.email}
        </div>
        <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '13px', gap: '6px' }}>
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
