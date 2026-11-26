import type { Handler } from '@netlify/functions'
import { admin } from '../lib/supabaseAdmin'
import { json, MAX_DOWNLOADS } from '../lib/http'

export const handler: Handler = async (event) => {
  const token = event.queryStringParameters?.token ?? ''
  if (!/^[0-9a-f]{48}$/.test(token)) return json(404, { error: 'Not found' })
  try {
    const { data, error } = await admin().from('orders')
      .select('status,download_count,books(title)').eq('download_token', token).maybeSingle()
    if (error) throw error
    if (!data) return json(404, { error: 'Not found' })
    const b = data.books as unknown as { title: string } | { title: string }[] | null
    const title = Array.isArray(b) ? b[0]?.title : b?.title
    return json(200, { status: data.status, title: title ?? 'Your book', downloadsLeft: Math.max(0, MAX_DOWNLOADS - data.download_count) })
  } catch (e) {
    console.error('order-status failed', e)
    return json(500, { error: 'Something went wrong.' })
  }
}
