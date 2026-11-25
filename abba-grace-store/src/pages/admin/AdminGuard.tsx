import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

/** Screen-level guard. Real protection is the database rules (RLS): a non-admin cannot read or write admin data even if this is bypassed. */
export default function AdminGuard() {
  const [state, setState] = useState<'loading' | 'in' | 'out'>('loading')
  useEffect(() => {
    let alive = true
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return alive && setState('out')
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
      if (alive) setState(data?.role === 'admin' ? 'in' : 'out')
    }
    check()
    const { data: sub } = supabase.auth.onAuthStateChange(() => check())
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])
  if (state === 'loading') return <div className="min-h-screen grid place-items-center text-royal-600" aria-busy="true">Checking access...</div>
  if (state === 'out') return <Navigate to="/admin/login" replace />
  return <Outlet />
}
