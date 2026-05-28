'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import InvoiceForm from '@/components/InvoiceForm'
import { apiFetch } from '@/lib/auth'
import type { Invoice } from '@/types'

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [inv, setInv] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch(`/api/invoices/${id}`).then(r => r.json()).then(setInv).finally(() => setLoading(false))
  }, [id])

  if (loading) return <AppShell><div style={{ color: '#94a3b8', paddingTop: '40px' }}>Loading…</div></AppShell>
  if (!inv) return <AppShell><div>Not found</div></AppShell>

  return (
    <AppShell>
      <div style={{ maxWidth: '860px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => router.back()} className="btn btn-ghost" style={{ fontSize: '18px', padding: '6px 10px' }}>←</button>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Edit {inv.invoice_number}</h1>
        </div>
        <InvoiceForm initial={inv} editId={Number(id)} />
      </div>
    </AppShell>
  )
}
