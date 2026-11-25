
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)

    const { data, error } = await supabase.auth.updateUser({
      password
    })

    setBusy(false)

    if (error) {
      setError(error.message)
      return
    }

    if (!data.user) {
      setError('Your recovery session is missing. Request a new reset email.')
      return
    }

    setMessage('Password updated successfully. Redirecting to login...')
    setTimeout(() => nav('/admin/login'), 2000)
  }

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-royal-900 to-royal-700 p-4">
      <form
        onSubmit={submit}
        className="bg-ivory rounded-2xl p-8 w-full max-w-sm shadow-2xl"
      >
        <h1 className="font-display text-2xl text-center text-royal-800">
          Reset Admin Password
        </h1>

        <label className="block mt-6 text-sm">
          New Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-royal-200 px-3 py-2"
          />
        </label>

        <label className="block mt-4 text-sm">
          Confirm New Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-royal-200 px-3 py-2"
          />
        </label>

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
          className="mt-6 w-full rounded-full bg-royal-700 text-white py-2.5 disabled:opacity-60"
        >
          {busy ? 'Updating...' : 'Save New Password'}
        </button>
      </form>
    </main>
  )
}
