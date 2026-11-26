import type { Handler } from '@netlify/functions'
import { admin } from '../lib/supabaseAdmin'
import { json, MAX_DOWNLOADS } from '../lib/http'

// Hands a PAID buyer a short-lived signed link to the private PDF. The PDF bucket is never public.
export const handler: Handler = async (event) => {
  const token = event.queryStringParameters?.token ?? ''
  if (!/^[0-9a-f]{48}$/.test(token)) return json(404, { error: 'Not found' })
  try {
    const db = admin()
    const { data: order, error } = await db.from('orders')
      .select('id,status,download_count,books(slug,file_path)').eq('download_token', token).maybeSingle()
    if (error) throw error
    if (!order) return json(404, { error: 'Not found' })
    if (order.status !== 'paid') return json(402, { error: 'Payment has not been confirmed yet.' })
    if (order.download_count >= MAX_DOWNLOADS) return json(403, { error: 'Download limit reached. Please contact us and we will help.' })

    const raw = order.books as unknown as { slug: string; file_path: string | null } | { slug: string; file_path: string | null }[] | null
    const book = Array.isArray(raw) ? raw[0] : raw
    if (!book?.file_path) return json(500, { error: 'File is unavailable. Please contact us.' })

    // Count the download first (guarded so two quick clicks cannot both use the same slot).
    const { data: bumped, error: bumpErr } = await db.from('orders')
      .update({ download_count: order.download_count + 1 })
      .eq('id', order.id).eq('download_count', order.download_count).select('id')
    if (bumpErr) throw bumpErr
    if (!bumped?.length) return json(409, { error: 'Please try again.' })

    const { data: signed, error: signErr } = await db.storage.from('book-files')
      .createSignedUrl(book.file_path, 120, { download: `${book.slug}.pdf` })
    if (signErr || !signed) throw signErr ?? new Error('no signed url')
    return { statusCode: 302, headers: { location: signed.signedUrl, 'cache-control': 'no-store' }, body: '' }
  } catch (e) {
    console.error('download failed', e)
    return json(500, { error: 'Something went wrong. Please try again.' })
  }
}
