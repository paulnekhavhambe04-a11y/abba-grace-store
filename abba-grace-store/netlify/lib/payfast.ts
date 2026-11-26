import { createHash } from 'node:crypto'
import { promises as dns } from 'node:dns'

export type Pair = [string, string]

// Sandbox defaults are PayFast's public test merchant. They only work against sandbox.payfast.co.za.
const SANDBOX_ID = '10000100'
const SANDBOX_KEY = '46f0cd694581a'

export function pfConfig() {
  const live = process.env.PAYFAST_MODE === 'live'
  const usingSandboxDefaults = !live && !process.env.PAYFAST_MERCHANT_ID
  const host = live ? 'www.payfast.co.za' : 'sandbox.payfast.co.za'
  return {
    live,
    merchantId: process.env.PAYFAST_MERCHANT_ID || (live ? '' : SANDBOX_ID),
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || (live ? '' : SANDBOX_KEY),
    // The shared test merchant has no passphrase, so ignore any passphrase while using it.
    passphrase: usingSandboxDefaults ? '' : (process.env.PAYFAST_PASSPHRASE || ''),
    processUrl: `https://${host}/eng/process`,
    validateUrl: `https://${host}/eng/query/validate`
  }
}
export type PfConfig = ReturnType<typeof pfConfig>

// Matches PHP urlencode(), which is what PayFast signs with: spaces -> '+', and !'()*~ are percent-encoded.
export const pfEncode = (v: string) =>
  encodeURIComponent(v).replace(/%20/g, '+').replace(/[!'()*~]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())

export const paramString = (pairs: Pair[]) => pairs.map(([k, v]) => `${k}=${pfEncode(v.trim())}`).join('&')

export const md5Signature = (pairs: Pair[], passphrase: string) => {
  let s = paramString(pairs)
  if (passphrase) s += `&passphrase=${pfEncode(passphrase.trim())}`
  return createHash('md5').update(s).digest('hex')
}

export interface CheckoutInput {
  returnUrl: string; cancelUrl: string; notifyUrl: string
  firstName?: string; email: string
  orderId: string; amountCents: number; itemName: string; itemDescription?: string
}

// Field ORDER matters: PayFast signs them in this documented order. Empty values are left out.
export function buildCheckoutFields(cfg: PfConfig, o: CheckoutInput): Pair[] {
  const all: Pair[] = [
    ['merchant_id', cfg.merchantId],
    ['merchant_key', cfg.merchantKey],
    ['return_url', o.returnUrl],
    ['cancel_url', o.cancelUrl],
    ['notify_url', o.notifyUrl],
    ['name_first', o.firstName ?? ''],
    ['email_address', o.email],
    ['m_payment_id', o.orderId],
    ['amount', (o.amountCents / 100).toFixed(2)],
    ['item_name', o.itemName.slice(0, 100)],
    ['item_description', (o.itemDescription ?? '').slice(0, 255)],
    ['email_confirmation', '1']
  ]
  const pairs = all.filter(([, v]) => v.trim() !== '')
  return [...pairs, ['signature', md5Signature(pairs, cfg.passphrase)]]
}

const PF_HOSTS = ['www.payfast.co.za', 'sandbox.payfast.co.za', 'w1w.payfast.co.za', 'w2w.payfast.co.za']
export async function isPayfastIp(ip: string) {
  const lists = await Promise.all(PF_HOSTS.map(h => dns.resolve4(h).catch(() => [] as string[])))
  return lists.flat().includes(ip)
}

// Ask PayFast to confirm it really sent this ITN. Body is the received fields, minus signature.
export async function serverConfirms(cfg: PfConfig, pairs: Pair[]) {
  const res = await fetch(cfg.validateUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: paramString(pairs)
  })
  return (await res.text()).trim() === 'VALID'
}
