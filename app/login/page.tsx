'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setAuth } from '@/lib/auth'
import { Spinner } from '@/components/Spinner'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (tab === 'forgot') {
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email }),
        })
        const data = await res.json()
        setLoading(false)

        if (!res.ok) {
          setError(data.error || 'Failed to send reset link.')
          return
        }

        setSuccess(data.message || 'Reset link sent successfully!')
        setForm(f => ({ ...f, email: '' }))
      } catch (err) {
        setLoading(false)
        setError('An unexpected error occurred.')
      }
      return
    }

    const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = tab === 'login'
      ? { email: form.email, password: form.password }
      : { email: form.email, password: form.password, name: form.name }
    
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      setAuth(data.token, data.user)
      router.push('/dashboard')
    } catch (err) {
      setLoading(false)
      setError('An unexpected error occurred.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#030213', marginBottom: '8px' }}>Invoice</div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Professional invoicing by swade-art</div>
        </div>
        <div className="card" style={{ borderRadius: '8px', padding: '32px' }}>
          {tab !== 'forgot' ? (
            <>
              <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
                {(['login', 'register'] as const).map(t => (
                  <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }} className="btn" disabled={loading} style={{
                    flex: 1, justifyContent: 'center',
                    background: tab === t ? 'white' : 'transparent',
                    color: tab === t ? '#111827' : '#6b7280',
                    boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    fontWeight: tab === t ? 600 : 400,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}>
                    {t === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tab === 'register' && (
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input" disabled={loading} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required style={{ opacity: loading ? 0.6 : 1 }} />
                  </div>
                )}
                <div>
                  <label className="label">Email</label>
                  <input className="input" disabled={loading} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required style={{ opacity: loading ? 0.6 : 1 }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="label">Password</label>
                    <button type="button" onClick={() => { setTab('forgot'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                      Forgot password?
                    </button>
                  </div>
                  <input className="input" disabled={loading} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required minLength={6} style={{ opacity: loading ? 0.6 : 1, marginTop: '4px' }} />
                </div>
                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>{error}</div>}
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: '12px', fontSize: '15px', fontWeight: 600, gap: '8px' }}>
                  {loading && <Spinner size="sm" color="white" />}
                  {loading ? 'Signing in…' : tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>Reset Password</h2>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Enter your email address and we'll send you a link to choose a new password.</p>
              
              {success && (
                <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px' }}>
                  {success}
                </div>
              )}

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">Email Address</label>
                  <input className="input" disabled={loading} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required style={{ opacity: loading ? 0.6 : 1 }} />
                </div>
                {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>{error}</div>}
                
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: '12px', fontSize: '15px', fontWeight: 600, gap: '8px' }}>
                  {loading && <Spinner size="sm" color="white" />}
                  {loading ? 'Sending link…' : 'Send Reset Link'}
                </button>

                <button type="button" onClick={() => { setTab('login'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', marginTop: '8px' }}>
                  Back to Sign In
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
