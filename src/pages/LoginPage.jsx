import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { normalizeAuthInput } from '../utils/authErrors'
import { cn } from '../lib/cn'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const { signIn, signUp, resetPassword, authError, clearAuthError, isConfigured, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/account'

  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  if (!isConfigured) {
    return (
      <div className="panel w-full max-w-[440px] p-8 text-left shadow-card">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-phosphor">Authentication</p>
        <h1 className="!mb-3 text-[1.75rem]">Supabase required</h1>
        <p className="mb-6 text-text-muted">
          Copy <code className="font-mono text-sm text-text">.env.example</code> to{' '}
          <code className="font-mono text-sm text-text">.env</code> and add your Supabase project
          credentials to enable sign in.
        </p>
        <Link to="/" className="btn btn-primary no-underline">
          Back home
        </Link>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    clearAuthError()

    const normalizedEmail = normalizeAuthInput(email)
    const normalizedPassword = normalizeAuthInput(password)
    const normalizedName = normalizeAuthInput(fullName)

    if (mode === 'reset') {
      const { error } = await resetPassword(normalizedEmail)
      setLoading(false)
      if (!error) {
        setMessage('Password reset email sent. Check your inbox.')
        setMode('signin')
      }
      return
    }

    if (mode === 'signin') {
      const { data, error } = await signIn({ email: normalizedEmail, password: normalizedPassword })
      setLoading(false)
      if (!error && data?.session) {
        navigate(from, { replace: true })
      }
      return
    }

    const { data, error } = await signUp({
      email: normalizedEmail,
      password: normalizedPassword,
      fullName: normalizedName,
    })
    setLoading(false)

    if (error) return

    if (data?.session) {
      navigate(from, { replace: true })
      return
    }

    setMessage('Check your email to confirm your account, then sign in.')
    setMode('signin')
  }

  function switchMode(next) {
    setMode(next)
    setMessage('')
    clearAuthError()
  }

  return (
    <div className="panel w-full max-w-[440px] p-8 text-left shadow-card">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-phosphor">Authentication</p>
      <h1 className="!mb-3 text-[1.75rem]">
        {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Reset password'}
      </h1>
      <p className="mb-6 text-text-muted">
        {mode === 'signin' && 'Access saved builds, order history, and checkout.'}
        {mode === 'signup' && 'Join Virtual Bytez to save custom builds and checkout.'}
        {mode === 'reset' && 'Enter your account email and we will send a reset link.'}
      </p>

      {mode !== 'reset' && (
        <div className="mb-6 flex gap-2" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            className={cn('filter-chip', mode === 'signin' && 'filter-chip-active')}
            onClick={() => switchMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={cn('filter-chip', mode === 'signup' && 'filter-chip-active')}
            onClick={() => switchMode('signup')}
          >
            Sign up
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        {mode === 'signup' && (
          <label className="form-label">
            Full name
            <input
              className="form-input"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="Ada Lovelace"
            />
          </label>
        )}
        <label className="form-label">
          Email
          <input
            className="form-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        {mode !== 'reset' && (
          <label className="form-label">
            Password
            <input
              className="form-input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder={mode === 'signin' ? 'Your password' : 'At least 6 characters'}
            />
          </label>
        )}

        {mode === 'signin' && (
          <button
            type="button"
            className="mb-2 self-start text-sm text-text-muted underline-offset-2 hover:text-text hover:underline"
            onClick={() => switchMode('reset')}
          >
            Forgot password?
          </button>
        )}

        {(authError || message) && (
          <p
            className={cn('mb-2 text-sm', authError ? 'text-danger' : 'text-phosphor')}
            role={authError ? 'alert' : 'status'}
          >
            {authError || message}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading
            ? 'Please wait…'
            : mode === 'signin'
              ? 'Sign in'
              : mode === 'signup'
                ? 'Create account'
                : 'Send reset link'}
        </Button>
      </form>

      {mode === 'reset' && (
        <button
          type="button"
          className="mt-4 text-sm text-text-muted underline-offset-2 hover:text-text hover:underline"
          onClick={() => switchMode('signin')}
        >
          Back to sign in
        </button>
      )}

      {from !== '/account' && (
        <p className="mt-5 text-center text-sm text-text-muted">
          You will return to{' '}
          <span className="font-mono text-text">{from}</span> after signing in.
        </p>
      )}
    </div>
  )
}
