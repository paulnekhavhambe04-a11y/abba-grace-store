import type { Handler } from '@netlify/functions'
import { db, json, cents } from './_shared/db'
import { signature, processUrl } from './_shared/payfast'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
  let body: { slug?: string; name?: string; email?: string }
  try { body = JSON.parse(event.body ?? '{}') } catch { return json(400, { error: 'Bad request' }) }
  const slug = String(body.slug ?? ''), name = String(body.name ?? '').trim().slice(0, 80), email = String(body.email ?? '').trim().toLowerCase().slice(0, 120)
  if (!slug || name.length < 2 || !EMAIL.test(email)) return json(400, { error: 'Please enter your full name and a valid email.' })

  const sb = db()
  // Price comes from the database, never from the browser.
  const { data: book } = await sb.from('books').select('id,title,price_cents,sale_price_cents,file_path,availability').eq('slug', slug).eq('is_published', true).maybeSingle()
  if (!book || !book.file_path || book.availability !== 'available') return json(404, { error: 'This book is not available.' })
  const total = book.sale_price_cents ?? book.price_cents
  if (total < 100) return json(400, { error: 'Invalid price.' })   // PayFast minimum is R5 in practice; guard against zero

  const { data: order, error } = await sb.from('orders').insert({
    book_id: book.id, book_title: book.title, customer_name: name, customer_email: email,
    subtotal_cents: book.price_cents, discount_cents: book.price_cents - total, total_cents: total
  }).select('id,order_number,access_token').single()
  if (error || !order) return json(500, { error: 'Could not start your order. Please try again.' })

  const site = (process.env.SITE_URL ?? '').replace(/\/$/, '')
  const [first, ...rest] = name.split(/\s+/)
  // Field ORDER matters for the signature (PayFast documented order).
  const pairs: [string, string][] = [
    ['merchant_id', process.env.PAYFAST_MERCHANT_ID ?? ''], ['merchant_key', process.env.PAYFAST_MERCHANT_KEY ?? ''],
    ['return_url', `${site}/order/${order.id}?t=${order.access_token}`],
    ['cancel_url', `${site}/order/${order.id}?t=${order.access_token}&cancelled=1`],
    ['notify_url', `${site}/.netlify/functions/payfast-itn`],
    ['name_first', first], ['name_last', rest.join(' ')], ['email_address', email],
    ['m_payment_id', order.id], ['amount', cents(total)], ['item_name', book.title.slice(0, 100)]
  ]
  const fields = Object.fromEntries(pairs.filter(([, v]) => v !== ''))
  return json(200, { action: processUrl(), fields: { ...fields, signature: signature(pairs) } })
}
