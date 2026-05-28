import { useState } from 'react'
import { api, setAuth } from '../lib/api'

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = tab === 'login' ? { email: form.email, password: form.password } : form
    const res = await api(url, { method: 'POST', body: JSON.stringify(body) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error'); return }
    setAuth(data.token, data.user)
    onLogin()
  }

  const s = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #312e81 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'white' }}>Invoice</div>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>swade-art.com</div>
        </div>
        <div className="card" style={{ borderRadius: '14px' }}>
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '8px', padding: '4px', marginBottom: '20px' }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className="btn" style={{
                flex: 1, justifyContent: 'center',
                background: tab === t ? 'white' : 'transparent',
                color: tab === t ? '#4f46e5' : '#94a3b8',
                fontWeight: tab === t ? 600 : 400,
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tab === 'register' && (
              <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={s('name')} required /></div>
            )}
            <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={s('email')} required /></div>
            <div><label className="label">Password</label><input className="input" type="password" value={form.password} onChange={s('password')} required minLength={6} /></div>
            {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: '11px', fontSize: '14px', fontWeight: 600 }}>
              {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
