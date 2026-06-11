import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSupabase } from '../lib/supabase'
import { formatAuthError } from '../utils/authErrors'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const supabase = getSupabase()

    if (!supabase) {
      setError('Supabase is not configured.')
      return undefined
    }

    async function completeAuth() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!active) return
        if (exchangeError) {
          setError(formatAuthError(exchangeError))
          return
        }
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (!active) return

      if (sessionError) {
        setError(formatAuthError(sessionError))
        return
      }

      if (session) {
        navigate('/account', { replace: true })
        return
      }

      setError('Could not complete sign in. Request a new confirmation link and try again.')
    }

    completeAuth()

    return () => {
      active = false
    }
  }, [navigate])

  return (
    <div className="panel w-full max-w-[440px] p-8 text-left shadow-card">
      <h1 className="!mb-3 text-[1.75rem]">Signing you in…</h1>
      {error ? (
        <>
          <p className="mb-6 text-sm text-danger">{error}</p>
          <Link to="/login" className="btn btn-primary no-underline">
            Back to login
          </Link>
        </>
      ) : (
        <p className="text-text-muted">Finishing authentication.</p>
      )}
    </div>
  )
}
