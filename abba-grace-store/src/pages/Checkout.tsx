import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { Book, getBook, currentPrice, formatZAR } from '../data/books'

// Builds a hidden form from the signed fields and posts it to PayFast, which takes the buyer to its payment page.
function postToPayFast(action: string, fields: [string, string][]) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = action
  for (const [name, value] of fields) {
    const input = document.createElement('input')
    input.type = 'hidden'; input.name = name; input.value = value
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
}

export default function Checkout() {
  const { slug = '' } = useParams()
  const [book, setBook] = useState<Book | null | undefined>(undefined)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { getBook(slug).then(setBook).catch(() => setBook(null)) }, [slug])

  if (book === undefined) return <div className="mx-auto max-w-xl px-4 py-16 animate-pulse h-72" aria-busy="true" />
  if (!book) return <div className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="font-display text-3xl">Book not found</h1><Link to="/store" className="underline text-royal-600">Back to the bookstore</Link></div>

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: book.slug, email, firstName })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not start payment. Please try again.')
      postToPayFast(data.action, data.fields)   // leaves the site; keep the button disabled
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start payment. Please try again.')
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-10">
      <Link to={`/store/${book.slug}`} className="inline-flex items-center gap-1 text-sm text-royal-600 hover:underline"><ArrowLeft size={16} /> Back to book</Link>
      <h1 className="font-display text-3xl text-royal-800 mt-4">Checkout</h1>
      <div className="flex gap-4 items-center mt-6 rounded-2xl bg-white border border-royal-100 p-4">
        <img src={book.coverUrl} alt="" width={64} height={85} className="rounded-md w-16 object-cover" />
        <div className="flex-1"><p className="font-display text-lg text-royal-800">{book.title}</p><p className="text-sm text-royal-500">PDF download</p></div>
        <p className="text-xl font-semibold text-gold-600">{formatZAR(currentPrice(book))}</p>
      </div>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="grid gap-1 text-sm text-royal-800">First name (optional)
          <input value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" maxLength={100} className="rounded-lg border border-royal-200 px-3 py-2 bg-white" />
        </label>
        <label className="grid gap-1 text-sm text-royal-800">Email address
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" maxLength={254} className="rounded-lg border border-royal-200 px-3 py-2 bg-white" />
          <span className="text-xs text-royal-500">PayFast sends your payment receipt here.</span>
        </label>
        {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
        <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-royal-900 font-semibold px-8 py-3">
          <Lock size={16} /> {busy ? 'Taking you to PayFast…' : `Pay ${formatZAR(currentPrice(book))} with PayFast`}
        </button>
        <p className="text-xs text-royal-500 text-center">Payment is handled securely by PayFast. We never see your card details.</p>
      </form>
    </section>
  )
}
