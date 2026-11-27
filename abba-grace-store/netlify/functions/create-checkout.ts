import type { Handler } from '@netlify/functions'
import { randomBytes } from 'node:crypto'
import { admin } from '../lib/supabaseAdmin'
import { json, siteUrl } from '../lib/http'
import { pfConfig, buildCheckoutFields } from '../lib/payfast'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  let body: { slug?: string; email?: string; firstName?: string }

  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return json(400, { error: 'Invalid request.' })
  }

  const slug = String(body.slug ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const firstName = String(body.firstName ?? '').trim().slice(0, 100)

  if (!slug || !EMAIL.test(email)) {
    return json(400, { error: 'Please enter a valid email address.' })
  }

  try {
    const db = admin()

    const { data: book, error: bookError } = await db
      .from('books')
      .select('id,title,price_cents,sale_price_cents,file_path,availability')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (bookError) throw bookError

    if (!book || !book.file_path || book.availability !== 'available') {
      return json(404, { error: 'This book is not available.' })
    }

    const amountCents = book.sale_price_cents ?? book.price_cents

    if (amountCents < 500) {
      return json(400, { error: 'The book price is below the PayFast minimum.' })
    }

    const downloadToken = randomBytes(24).toString('hex')

    const { data: order, error: orderError } = await db
      .from('orders')
      .insert({
        book_id: book.id,
        email,
        first_name: firstName || null,
        amount_cents: amountCents,
        download_token: downloadToken
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('Order creation failed:', orderError)
      return json(500, { error: 'Could not create your order.' })
    }

    const site = siteUrl(event.headers)
    const config = pfConfig()

    if (!config.merchantId || !config.merchantKey) {
      throw new Error('PayFast merchant credentials are missing.')
    }

    const fields = buildCheckoutFields(config, {
      returnUrl: `${site}/order/${downloadToken}`,
      cancelUrl: `${site}/order/${downloadToken}?cancelled=1`,
      notifyUrl: `${site}/.netlify/functions/payfast-itn`,
      firstName,
      email,
      orderId: order.id,
      amountCents,
      itemName: book.title
    })

    return json(200, {
      action: config.processUrl,
      fields: Object.fromEntries(fields)
    })
  } catch (error) {
    console.error('Checkout failed:', error)
    return json(500, {
      error: 'Could not start payment. Please try again.'
    })
  }
}
