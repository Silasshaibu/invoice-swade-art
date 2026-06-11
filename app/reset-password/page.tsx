'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Spinner } from '@/components/Spinner'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError('Invalid reset token link.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      setLoading(false)

      if (!res.ok) {
        setError(data.error || 'Failed to reset password. The link may have expired.')
        return
      }

      setSuccess('Your password has been reset successfully! Redirecting you to sign in...')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setLoading(false)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="card" style={{ borderRadius: '8px', padding: '32px' }}>
      {!token ? (
        <div style={{ color: '#dc2626', background: '#fee2e2', padding: '12px', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}>
          Invalid or missing reset token link. Please request a new password reset link from the login page.
        </div>
      ) : success ? (
        <div style={{ color: '#15803d', background: '#dcfce7', padding: '16px', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}>
          {success}
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">New Password</label>
            <input
              className="input"
              disabled={loading}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{ opacity: loading ? 0.6 : 1 }}
            />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              className="input"
              disabled={loading}
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{ opacity: loading ? 0.6 : 1 }}
            />
          </div>
          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ justifyContent: 'center', padding: '12px', fontSize: '15px', fontWeight: 600, gap: '8px' }}
          >
            {loading && <Spinner size="sm" color="white" />}
            {loading ? 'Resetting password…' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#030213', marginBottom: '8px' }}>Reset Password</div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Choose a new password for your account</div>
        </div>
        <Suspense fallback={<div className="card" style={{ borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#6b7280' }}>Loading reset page...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
