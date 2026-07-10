'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Spinner } from '@/components/Spinner'

interface RequestDetails {
  name: string
  email: string
  requestedAt: string
}

function ReviewRequestForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [details, setDetails] = useState<RequestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [deciding, setDeciding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing request link.')
      setLoading(false)
      return
    }
    fetch(`/api/auth/access-requests/decision?token=${encodeURIComponent(token)}`)
      .then(async res => {
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to load request details.')
          return
        }
        setDetails(data)
      })
      .catch(() => setError('An unexpected error occurred.'))
      .finally(() => setLoading(false))
  }, [token])

  const decide = async (decision: 'approved' | 'rejected') => {
    if (!token) return
    setDeciding(true)
    setError('')
    try {
      const res = await fetch('/api/auth/access-requests/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, decision }),
      })
      const data = await res.json()
      setDeciding(false)
      if (!res.ok) {
        setError(data.error || 'Failed to submit decision.')
        return
      }
      setSuccess(decision === 'approved' ? 'Access granted. The requester can now create their account.' : 'Request rejected.')
    } catch (err) {
      setDeciding(false)
      setError('An unexpected error occurred.')
    }
  }

  return (
    <div className="card" style={{ borderRadius: '8px', padding: '32px' }}>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>Loading request…</div>
      ) : success ? (
        <div style={{ color: '#15803d', background: '#dcfce7', padding: '16px', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}>
          {success}
        </div>
      ) : error ? (
        <div style={{ color: '#dc2626', background: '#fee2e2', padding: '12px', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}>
          {error}
        </div>
      ) : details ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Name</label>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{details.name}</div>
          </div>
          <div>
            <label className="label">Email</label>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{details.email}</div>
          </div>
          <div>
            <label className="label">Requested</label>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>{new Date(details.requestedAt).toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              className="btn btn-primary"
              disabled={deciding}
              onClick={() => decide('approved')}
              style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '14px', fontWeight: 600, gap: '8px' }}
            >
              {deciding && <Spinner size="sm" color="white" />}
              Grant Access
            </button>
            <button
              className="btn btn-danger"
              disabled={deciding}
              onClick={() => decide('rejected')}
              style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '14px', fontWeight: 600 }}
            >
              Reject
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function ReviewAccessRequestPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#030213', marginBottom: '8px' }}>Access Request</div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Review and decide on this registration request</div>
        </div>
        <Suspense fallback={<div className="card" style={{ borderRadius: '8px', padding: '32px', textAlign: 'center', color: '#6b7280' }}>Loading…</div>}>
          <ReviewRequestForm />
        </Suspense>
      </div>
    </div>
  )
}
