import type { Handler } from '@netlify/functions'
import { randomBytes } from 'node:crypto'
import { admin } from '../lib/supabaseAdmin'
import { buildCheckoutFields, pfConfig } from '../lib/payfast'
import { json, siteUrl } from '../lib/http'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_CENTS = 500 // PayFast does not accept payments below R5.00

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
  let body: Record<string, unknown>
  try { body = JSON.parse(event.body ?? '{}') } catch { return json(400, { error: 'Invalid request.' }) }

  const slug = String(body.slug ?? '').slice(0, 200)
  const email = String(body.email ?? '').trim().toLowerCase()
  const firstName = String(body.firstName ?? '').trim().slice(0, 100)
  if (!slug) return json(400, { error: 'Missing book.' })
  if (email.length > 254 || !EMAIL_RE.test(email)) return json(400, { error: 'Please enter a valid email address.' })

  const cfg = pfConfig()
  if (!cfg.merchantId || !cfg.merchantKey) {
    console.error('PayFast is not configured: set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY')
    return json(500, { error: 'Payments are not set up yet. Please try again later.' })
  }

  try {
    const db = admin()
    // Price ALWAYS comes from the database, never from the browser.
    const { data: book, error } = await db.from('books')
      .select('id,slug,title,short_description,file_path,price_cents,sale_price_cents')
      .eq('slug', slug).eq('is_published', true).maybeSingle()
    if (error) throw error
    if (!book) return json(404, { error: 'Book not found.' })
    if (!book.file_path) return json(409, { error: 'This book is not ready for sale yet.' })
    const amountCents: number = book.sale_price_cents ?? book.price_cents
    if (amountCents < MIN_CENTS) return json(409, { error: 'This book cannot be bought online at this price (PayFast minimum is R5.00).' })

    const token = randomBytes(24).toString('hex')
    const { data: order, error: insErr } = await db.from('orders').insert({
      book_id: book.id, email, first_name: firstName || null, amount_cents: amountCents, download_token: token
    }).select('id').single()
    if (insErr) throw insErr

    const site = siteUrl(event.headers)
    const fields = buildCheckoutFields(cfg, {
      returnUrl: `${site}/order/${token}`,
      cancelUrl: `${site}/store/${book.slug}?payment=cancelled`,
      notifyUrl: `${site}/.netlify/functions/payfast-itn`,
      firstName, email, orderId: order.id, amountCents,
      itemName: book.title, itemDescription: book.short_description
    })
    return json(200, { action: cfg.processUrl, fields })
  } catch (e) {
    console.error('create-checkout failed', e)
    return json(500, { error: 'Something went wrong starting your payment. Please try again.' })
  }
}
