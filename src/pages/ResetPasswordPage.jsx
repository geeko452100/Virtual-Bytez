import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { completeAuthCallback } from '../lib/authCallback'
import { getSupabase } from '../lib/supabase'
import { cn } from '../lib/cn'
import Button from '../components/ui/Button'

export default function ResetPasswordPage() {
  const { updatePassword, authError, clearAuthError, isConfigured } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verifying, setVerifying] = useState(true)
  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isConfigured) {
      setVerifying(false)
      setError('Supabase is not configured.')
      return undefined
    }

    let active = true
    const supabase = getSupabase()
    if (!supabase) {
      setVerifying(false)
      setError('Supabase is not configured.')
      return undefined
    }

    completeAuthCallback(supabase).then(({ session, error: callbackError }) => {
      if (!active) return
      setVerifying(false)

      if (callbackError) {
        setError(callbackError)
        return
      }

      if (session) {
        setReady(true)
        return
      }

      setError('This reset link is invalid or expired. Request a new one from the login page.')
    })

    return () => {
      active = false
    }
  }, [isConfigured])

  async function handleSubmit(e) {
    e.preventDefault()
    clearAuthError()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    const { error: updateError } = await updatePassword(password)
    setSubmitting(false)

    if (updateError) return

    navigate('/account', {
      replace: true,
      state: { passwordUpdated: true },
    })
  }

  if (!isConfigured) {
    return (
      <div className="panel w-full max-w-[440px] p-8 text-left shadow-card">
        <h1 className="!mb-3 text-[1.75rem]">Supabase required</h1>
        <p className="mb-6 text-text-muted">Add Supabase credentials to enable password reset.</p>
        <Link to="/login" className="btn btn-primary no-underline">
          Back to login
        </Link>
      </div>
    )
  }

  if (verifying) {
    return (
      <div className="panel w-full max-w-[440px] p-8 text-left shadow-card">
        <h1 className="!mb-3 text-[1.75rem]">Verifying reset link…</h1>
        <p className="text-text-muted">Hang tight while we confirm your request.</p>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="panel w-full max-w-[440px] p-8 text-left shadow-card">
        <h1 className="!mb-3 text-[1.75rem]">Reset link expired</h1>
        <p className="mb-6 text-sm text-danger">{error || authError}</p>
        <Link to="/login" className="btn btn-primary no-underline">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="panel w-full max-w-[440px] p-8 text-left shadow-card">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-phosphor">Account</p>
      <h1 className="!mb-3 text-[1.75rem]">Choose a new password</h1>
      <p className="mb-6 text-text-muted">
        Enter a new password for your Virtual Bytez account.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        <label className="form-label">
          New password
          <input
            className="form-input"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </label>
        <label className="form-label">
          Confirm password
          <input
            className="form-input"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Repeat your new password"
          />
        </label>

        {(error || authError) && (
          <p className={cn('mb-2 text-sm text-danger')} role="alert">
            {error || authError}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" disabled={submitting}>
          {submitting ? 'Updating password…' : 'Update password'}
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-4 inline-block text-sm text-text-muted no-underline underline-offset-2 hover:text-text hover:underline"
      >
        Back to sign in
      </Link>
    </div>
  )
}
