import type { Handler } from '@netlify/functions'
import { admin } from '../lib/supabaseAdmin'
import { isPayfastIp, md5Signature, pfConfig, serverConfirms, type Pair } from '../lib/payfast'

// PayFast calls this URL (server to server) after every payment. This is the ONLY place an order becomes "paid".
// We never trust the browser redirect, because anyone can open the return URL.
const bad = (msg: string) => { console.error('ITN rejected:', msg); return { statusCode: 400, body: msg } }

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }
  const cfg = pfConfig()
  const raw = event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64').toString('utf8') : (event.body ?? '')
  const all: Pair[] = [...new URLSearchParams(raw).entries()]            // keeps PayFast's field order
  const data = Object.fromEntries(all) as Record<string, string>
  const pairs = all.filter(([k]) => k !== 'signature')

  // 1. Signature
  if (!data.signature || md5Signature(pairs, cfg.passphrase) !== data.signature) return bad('bad signature')
  // 2. Merchant
  if (data.merchant_id !== cfg.merchantId) return bad('merchant mismatch')
  // 3. Sender IP (Netlify puts the real client IP in this header)
  const ip = event.headers['x-nf-client-connection-ip']
  if (ip && !(await isPayfastIp(ip))) return bad(`unexpected sender ${ip}`)

  try {
    const db = admin()
    const { data: order, error } = await db.from('orders').select('id,status,amount_cents').eq('id', data.m_payment_id ?? '').maybeSingle()
    if (error) throw error
    if (!order) return bad('unknown order')
    // 4. Amount must match what WE stored, to the cent
    if (Math.abs(Math.round(parseFloat(data.amount_gross) * 100) - order.amount_cents) > 1) return bad('amount mismatch')
    // 5. PayFast confirms it sent this
    if (!(await serverConfirms(cfg, pairs))) return bad('PayFast did not confirm')

    if (data.payment_status === 'COMPLETE') {
      if (order.status !== 'paid') {
        const { error: upErr } = await db.from('orders')
          .update({ status: 'paid', paid_at: new Date().toISOString(), pf_payment_id: data.pf_payment_id ?? null })
          .eq('id', order.id)
        if (upErr) throw upErr
      }
    } else if (data.payment_status === 'FAILED' || data.payment_status === 'CANCELLED') {
      // never downgrade an order that is already paid
      await db.from('orders').update({ status: data.payment_status.toLowerCase() }).eq('id', order.id).eq('status', 'pending')
    }
    return { statusCode: 200, body: 'OK' }
  } catch (e) {
    console.error('ITN processing failed', e)
    return { statusCode: 500, body: 'error' }   // non-200 makes PayFast retry later
  }
}
