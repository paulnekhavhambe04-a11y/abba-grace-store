import { supabase } from '../lib/supabase'

export interface Book {
  id: string; slug: string; title: string; author: string; category: string
  shortDescription: string; description: string; coverUrl: string
  priceCents: number; salePriceCents?: number; format: 'PDF'; available: boolean; featured: boolean
}

// Columns safe for the public. file_path (the private PDF location) is never selected here.
const COLS = 'id,slug,title,author,category,short_description,description,cover_path,price_cents,sale_price_cents,is_featured,is_published'

export const coverUrlFor = (path: string | null) =>
  path ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/covers/${path}` : '/brand/logo.webp'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toBook = (r: any): Book => ({
  id: r.id, slug: r.slug, title: r.title, author: r.author, category: r.category,
  shortDescription: r.short_description, description: r.description, coverUrl: coverUrlFor(r.cover_path),
  priceCents: r.price_cents, salePriceCents: r.sale_price_cents ?? undefined, format: 'PDF',
  available: r.is_published, featured: r.is_featured
})

export const formatZAR = (cents: number) => 'R' + (cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const currentPrice = (b: Book) => b.salePriceCents ?? b.priceCents

export const getBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase.from('books').select(COLS).eq('is_published', true).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toBook)
}
export const getBook = async (slug: string): Promise<Book | null> => {
  const { data, error } = await supabase.from('books').select(COLS).eq('slug', slug).eq('is_published', true).maybeSingle()
  if (error) throw error
  return data ? toBook(data) : null
}
