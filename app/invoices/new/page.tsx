'use client'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import InvoiceForm from '@/components/InvoiceForm'

export default function NewInvoicePage() {
  const router = useRouter()
  return (
    <AppShell>
      <div style={{ maxWidth: '860px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => router.back()} className="btn btn-ghost" style={{ fontSize: '18px', padding: '6px 10px' }}>←</button>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>New Invoice</h1>
        </div>
        <InvoiceForm />
      </div>
    </AppShell>
  )
}
