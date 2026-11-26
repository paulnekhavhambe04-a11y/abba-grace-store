import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Download, Loader2, XCircle } from 'lucide-react'

interface Status { status: 'pending' | 'paid' | 'failed' | 'cancelled'; title: string; downloadsLeft: number }

// The buyer lands here after PayFast. Payment is confirmed by PayFast's server notification (the ITN),
// which can arrive a few seconds after the redirect, so we poll until the order flips to "paid".
export default function Order() {
  const { token = '' } = useParams()
  const [s, setS] = useState<Status | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [gaveUp, setGaveUp] = useState(false)

  useEffect(() => {
    let stop = false
    let timer: number | undefined
    const started = Date.now()
    const poll = async () => {
      try {
        const r = await fetch(`/api/order-status?token=${encodeURIComponent(token)}`)
        if (stop) return
        if (r.status === 404) { setNotFound(true); return }
        if (r.ok) {
          const d: Status = await r.json()
          if (stop) return
          setS(d)
          if (d.status !== 'pending') return
        }
      } catch { /* network blip: try again */ }
      if (Date.now() - started > 180_000) { setGaveUp(true); return }
      timer = window.setTimeout(poll, 3000)
    }
    poll()
    return () => { stop = true; window.clearTimeout(timer) }
  }, [token])

  const wrap = (children: React.ReactNode) => <section className="mx-auto max-w-xl px-4 py-16 text-center">{children}</section>

  if (notFound) return wrap(<><h1 className="font-display text-3xl text-royal-800">Order not found</h1><Link to="/store" className="underline text-royal-600">Back to the bookstore</Link></>)
  if (!s) return wrap(<Loader2 className="mx-auto animate-spin text-royal-500" aria-label="Loading" />)

  if (s.status === 'paid') return wrap(<>
    <CheckCircle2 size={48} className="mx-auto text-green-600" />
    <h1 className="font-display text-3xl text-royal-800 mt-4">Thank you!</h1>
    <p className="mt-2 text-royal-700">Your payment for <strong>{s.title}</strong> is confirmed.</p>
    {s.downloadsLeft > 0
      ? <a href={`/api/download?token=${encodeURIComponent(token)}`} className="inline-flex items-center gap-2 mt-6 rounded-full bg-gold-500 hover:bg-gold-400 text-royal-900 font-semibold px-8 py-3"><Download size={18} /> Download PDF</a>
      : <p className="mt-6 text-red-700">You've used all your downloads. Please contact us and we'll help.</p>}
    <p className="mt-6 text-sm text-royal-600">Bookmark this page. It is your personal download link ({s.downloadsLeft} download{s.downloadsLeft === 1 ? '' : 's'} left).</p>
  </>)

  if (s.status === 'failed' || s.status === 'cancelled') return wrap(<>
    <XCircle size={48} className="mx-auto text-red-600" />
    <h1 className="font-display text-3xl text-royal-800 mt-4">Payment {s.status === 'failed' ? 'failed' : 'cancelled'}</h1>
    <p className="mt-2 text-royal-700">You have not been charged for <strong>{s.title}</strong>.</p>
    <Link to="/store" className="inline-block mt-6 underline text-royal-600">Back to the bookstore</Link>
  </>)

  return wrap(<>
    <Loader2 size={40} className={`mx-auto text-royal-500 ${gaveUp ? '' : 'animate-spin'}`} aria-hidden="true" />
    <h1 className="font-display text-3xl text-royal-800 mt-4">{gaveUp ? 'Still waiting for PayFast' : 'Confirming your payment…'}</h1>
    <p className="mt-2 text-royal-700">{gaveUp
      ? 'PayFast has not confirmed the payment yet. If you paid, keep this page bookmarked and refresh it in a few minutes.'
      : 'This usually takes a few seconds. Please keep this page open.'}</p>
    {gaveUp && <button onClick={() => window.location.reload()} className="mt-6 rounded-full bg-royal-700 hover:bg-royal-600 text-white px-6 py-2.5">Check again</button>}
  </>)
}
