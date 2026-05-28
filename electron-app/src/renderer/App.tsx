import { useState, useEffect } from 'react'
import { isLoggedIn } from './lib/api'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import InvoicesPage from './pages/InvoicesPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import NewInvoicePage from './pages/NewInvoicePage'
import EditInvoicePage from './pages/EditInvoicePage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import Sidebar from './components/Sidebar'

export type Page =
  | { name: 'dashboard' }
  | { name: 'clients' }
  | { name: 'invoices' }
  | { name: 'invoice'; id: number }
  | { name: 'invoice-new' }
  | { name: 'invoice-edit'; id: number }
  | { name: 'reports' }
  | { name: 'settings' }

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())
  const [page, setPage] = useState<Page>({ name: 'dashboard' })

  useEffect(() => {
    const check = () => setLoggedIn(isLoggedIn())
    window.addEventListener('storage', check)
    return () => window.removeEventListener('storage', check)
  }, [])

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />

  const nav = (p: Page) => setPage(p)

  const renderPage = () => {
    switch (page.name) {
      case 'dashboard': return <DashboardPage nav={nav} />
      case 'clients':   return <ClientsPage nav={nav} />
      case 'invoices':  return <InvoicesPage nav={nav} />
      case 'invoice':   return <InvoiceDetailPage id={page.id} nav={nav} />
      case 'invoice-new': return <NewInvoicePage nav={nav} />
      case 'invoice-edit': return <EditInvoicePage id={page.id} nav={nav} />
      case 'reports':   return <ReportsPage />
      case 'settings':  return <SettingsPage />
      default: return <DashboardPage nav={nav} />
    }
  }

  return (
    <div id="root" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar currentPage={page.name} nav={nav} onLogout={() => setLoggedIn(false)} />
      <main className="main">
        {renderPage()}
      </main>
    </div>
  )
}
