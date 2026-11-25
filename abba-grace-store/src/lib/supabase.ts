import { createClient } from '@supabase/supabase-js'
// Anon key only. RLS limits it to published books + admin session.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost',
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'missing'
)
