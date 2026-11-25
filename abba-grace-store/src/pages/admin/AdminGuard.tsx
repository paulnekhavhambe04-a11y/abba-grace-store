
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const nav = useNavigate()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setBusy(false)

    if (error) {
      setError('Login failed. Check your email and password.')
      return
    }

    nav('/admin')
  }

  const resetPassword = async () => {
    if (!email) {
      setError('Please enter your admin email first.')
      return
    }

    setBusy(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/admin/reset-password`
      }
    )

    setBusy(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Password recovery email sent. Check your inbox.')
  }

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-royal-900 to-royal-700 p-4">
      <form
        onSubmit={submit}
        className="bg-ivory rounded-2xl p-8 w-full max-w-sm shadow-2xl"
      >
        <img
          src="/brand/logo.webp"
          alt="Abba Grace"
          width={90}
          height={90}
          className="mx-auto"
        />

        <h1 className="font-display text-2xl text-center text-royal-800 mt-2">
          Admin Login
        </h1>

        <label className="block mt-6 text-sm">
          Email
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-royal-200 px-3 py-2"
          />
        </label>

        <label className="block mt-4 text-sm">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-royal-200 px-3 py-2"
          />
        </label>

        <button
          type="button"
          onClick={resetPassword}
          disabled={busy}
          className="mt-3 text-sm text-royal-700 underline"
        >
          Forgot password?
        </button>

        {error && (
          <p role="alert" className="text-red-700 text-sm mt-3">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-green-700 text-sm mt-3">
            {message}
          </p>
        )}

        <button
          disabled={busy}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-full bg-royal-700 hover:bg-royal-600 text-white py-2.5 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Lock size={16} />
          )}
          Sign in
        </button>
      </form>
    </main>
  )
}
