import { clearAuth, getUser } from '../lib/api'
import type { Page } from '../App'

const NAV: { key: Page['name']; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { key: 'invoices',  label: 'Invoices',  icon: '📄' },
  { key: 'clients',   label: 'Clients',   icon: '👥' },
  { key: 'reports',   label: 'Reports',   icon: '📊' },
  { key: 'settings',  label: 'Settings',  icon: '⚙️' },
]

interface Props {
  currentPage: string
  nav: (p: Page) => void
  onLogout: () => void
}

export default function Sidebar({ currentPage, nav, onLogout }: Props) {
  const user = getUser()

  const logout = async () => {
    try {
      const token = localStorage.getItem('inv_token')
      await fetch(`${import.meta.env.VITE_API_URL || 'https://invoice.swade-art.com'}/api/auth/logout`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      })
    } catch {}
    clearAuth()
    onLogout()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div>Invoice</div>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>swade-art.com</div>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button key={item.key} className={`nav-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => nav({ name: item.key } as Page)}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || user?.email}</div>
        <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '12px', color: '#64748b' }}>Sign Out</button>
      </div>
    </aside>
  )
}
