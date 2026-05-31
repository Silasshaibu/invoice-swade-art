'use client'
import { useEffect, useState } from 'react'
import { Building2, FileText, Bell, FileJson, Upload } from 'lucide-react'
import AppShell from '@/components/AppShell'
import { apiFetch } from '@/lib/auth'

export default function SettingsPage() {
  const [form, setForm] = useState({ name: '', company_name: '', company_address: '', company_phone: '', company_email: '', company_website: '', tax_id: '', currency: 'USD', email: '', logo: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [invoicePrefix, setInvoicePrefix] = useState('INV')
  const [nextInvoiceNum, setNextInvoiceNum] = useState('007')
  const [paymentTerms, setPaymentTerms] = useState('14')
  const [invoiceNotes, setInvoiceNotes] = useState('Thank you for your business. Payment is due within 14 days.')
  const [emailNotifications, setEmailNotifications] = useState({ sent: true, received: true, overdue: true })
  const [pdfTemplate, setPdfTemplate] = useState('professional')

  useEffect(() => {
    apiFetch('/api/auth/me').then(r => r.json()).then(u => {
      setForm({
        name: u.name || '',
        company_name: u.company_name || '',
        company_address: u.company_address || '',
        company_phone: u.company_phone || '',
        company_email: u.company_email || '',
        company_website: u.company_website || '',
        tax_id: u.tax_id || '',
        currency: u.currency || 'USD',
        email: u.email || '',
        logo: u.company_logo || ''
      })
    }).finally(() => setLoading(false))
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await apiFetch('/api/auth/me', { method: 'PUT', body: JSON.stringify(form) })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <AppShell><div style={{ color: '#94a3b8', paddingTop: '40px' }}>Loading…</div></AppShell>

  return (
    <AppShell>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>Manage system preferences and configuration</p>
      </div>

      {/* Company Information Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Building2 size={24} style={{ color: '#6b7280' }} />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Company Information</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Details displayed on invoices and communications</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Company Logo</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '112px', height: '112px', borderRadius: '8px', backgroundColor: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {form.logo ? <img src={form.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <Upload size={32} style={{ color: '#9ca3af' }} />}
              </div>
              <div>
                <button className="btn btn-ghost" style={{ fontSize: '14px', gap: '6px', marginBottom: '8px' }}>
                  <Upload size={16} />
                  Upload Logo
                </button>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Upload your company logo to appear on invoices and the login page. Recommended size: 200x200px.</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid-2col">
              <div>
                <label className="label">Company Name *</label>
                <input className="input" value={form.company_name} onChange={set('company_name')} placeholder="Your Company Name" required />
              </div>
              <div>
                <label className="label">Tax ID / EIN</label>
                <input className="input" value={form.tax_id} onChange={set('tax_id')} placeholder="12-3456789" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" value={form.company_email} onChange={set('company_email')} type="email" placeholder="contact@company.com" required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.company_phone} onChange={set('company_phone')} placeholder="+1 (555) 123-4567" />
              </div>
              <div>
                <label className="label">Website</label>
                <input className="input" value={form.company_website} onChange={set('company_website')} placeholder="www.company.com" />
              </div>
              <div>
                <label className="label">Default Currency</label>
                <select className="input" value={form.currency} onChange={set('currency')}>
                  {['USD','EUR','GBP','GHS','NGN','CAD','AUD','ZAR'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Business Address</label>
              <textarea className="input" value={form.company_address} onChange={set('company_address')} placeholder="123 Business St&#10;Suite 100&#10;City, State 12345" rows={3} style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              {saved && <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: 500 }}>Saved!</span>}
            </div>
          </form>
        </div>
      </div>

      {/* Invoice Settings Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FileText size={24} style={{ color: '#6b7280' }} />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Invoice Settings</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Configure default invoice behavior</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="grid-2col">
            <div>
              <label className="label">Invoice Prefix</label>
              <input className="input" value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} placeholder="INV" />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Prefix for invoice numbers (e.g. INV-001)</p>
            </div>
            <div>
              <label className="label">Next Invoice Number</label>
              <input className="input" value={nextInvoiceNum} onChange={e => setNextInvoiceNum(e.target.value)} placeholder="007" />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Next sequential number to use</p>
            </div>
            <div>
              <label className="label">Default Payment Terms (Days)</label>
              <input className="input" type="number" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Number of days until payment is due</p>
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={set('currency')}>
                {['USD','EUR','GBP','GHS','NGN','CAD','AUD','ZAR'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Default Invoice Notes</label>
            <textarea className="input" value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>This text will appear at the bottom of all invoices</p>
          </div>
        </div>
      </div>

      {/* Notification Settings Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Bell size={24} style={{ color: '#6b7280' }} />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Notification Settings</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Manage email notifications and alerts</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Email Notifications</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>Receive email updates for important events</p>
            {[
              { key: 'sent', label: 'Invoice sent confirmation', checked: emailNotifications.sent },
              { key: 'received', label: 'Payment received', checked: emailNotifications.received },
              { key: 'overdue', label: 'Overdue invoice alerts', checked: emailNotifications.overdue },
            ].map(item => (
              <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', cursor: 'pointer' }}>
                <input type="checkbox" checked={item.checked} onChange={e => setEmailNotifications(n => ({ ...n, [item.key]: e.target.checked }))} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <span style={{ fontSize: '14px', color: '#030213', fontWeight: 500 }}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* PDF Template Settings Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FileJson size={24} style={{ color: '#6b7280' }} />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>PDF Template Settings</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Choose a template for your invoices</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { id: 'professional', name: 'Professional', desc: 'Clean layout with company logo, centered dates, and detailed footer with bank information' },
            { id: 'classic', name: 'Classic', desc: 'Traditional invoice format with simple header and basic company details' },
            { id: 'modern', name: 'Modern', desc: 'Contemporary design with bold typography and minimalist aesthetic' },
            { id: 'compact', name: 'Compact', desc: 'Space-efficient layout ideal for single-page invoices with multiple line items' },
          ].map(template => (
            <div key={template.id} style={{ padding: '16px', border: pdfTemplate === template.id ? '2px solid #0066cc' : '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setPdfTemplate(template.id)}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{template.name}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{template.desc}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="btn btn-ghost" style={{ fontSize: '13px', gap: '6px' }} onClick={e => { e.stopPropagation() }}>Preview</button>
                <div style={{ width: '40px', height: '40px', borderRadius: '6px', border: '2px solid ' + (pdfTemplate === template.id ? '#0066cc' : '#e5e7eb'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: pdfTemplate === template.id ? '#0066cc' : 'transparent', border: pdfTemplate === template.id ? 'none' : '2px solid #d1d5db' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', marginTop: '32px' }}>
        <button onClick={() => window.location.reload()} className="btn btn-ghost">Cancel</button>
        <button onClick={submit} className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        {saved && <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: 500 }}>✓ All changes saved</span>}
      </div>
    </AppShell>
  )
}
