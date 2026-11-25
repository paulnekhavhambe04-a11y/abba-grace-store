
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

type AccessState = 'loading' | 'in' | 'out' | 'error'

export default function AdminGuard() {
  const [state, setState] = useState<AccessState>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let alive = true
    let timer: number | undefined

    const checkAccess = async (existingSession?: Session | null) => {
      setState('loading')
      setErrorMessage('')

      try {
        let session = existingSession

        if (session === undefined) {
          const { data, error } = await supabase.auth.getSession()

          if (error) throw error

          session = data.session
        }

        if (!session) {
          if (alive) setState('out')
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()

        if (error) throw error

        if (!profile) {
          if (alive) {
            setErrorMessage(
              'Your user account has no matching profile in the database.'
            )
            setState('error')
          }
          return
        }

        if (profile.role !== 'admin') {
          if (alive) setState('out')
          return
        }

        if (alive) setState('in')
      } catch (error) {
        console.error('Admin access check failed:', error)

        if (alive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Could not verify admin permissions.'
          )
          setState('error')
        }
      }
    }

    void checkAccess()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setState('out')
        return
      }

      // Run the database check after the auth callback finishes.
      if (timer !== undefined) window.clearTimeout(timer)

      timer = window.setTimeout(() => {
        void checkAccess(session)
      }, 0)
    })

    return () => {
      alive = false

      if (timer !== undefined) {
        window.clearTimeout(timer)
      }

      subscription.unsubscribe()
    }
  }, [])

  if (state === 'loading') {
    return (
      <div
        className="min-h-screen grid place-items-center text-royal-600"
        aria-busy="true"
      >
        Checking admin access...
      </div>
    )
  }

  if (state === 'error') {
    return (
      <main className="min-h-screen grid place-items-center bg-ivory p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="font-display text-2xl text-royal-800">
            Admin Access Error
          </h1>

          <p className="mt-4 text-red-700 text-sm break-words">
            {errorMessage}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-full bg-royal-700 text-white py-3"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  if (state === 'out') {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
