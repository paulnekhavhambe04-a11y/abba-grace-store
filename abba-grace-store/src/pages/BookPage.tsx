import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, FileText, ShoppingCart } from 'lucide-react'
import { Book, getBook, currentPrice, formatZAR } from '../data/books'

export default function BookPage() {
  const { slug = '' } = useParams()
  const [book, setBook] = useState<Book | null | undefined>(undefined)
  useEffect(() => { getBook(slug).then(setBook) }, [slug])
  if (book === undefined) return <div className="mx-auto max-w-5xl px-4 py-16 animate-pulse h-96" aria-busy="true" />
  if (!book) return <div className="mx-auto max-w-5xl px-4 py-16 text-center"><h1 className="font-display text-3xl">Book not found</h1><Link to="/store" className="underline text-royal-600">Back to the bookstore</Link></div>
  // Checkout is built in Phase 5 (PayFast). Link target /checkout/:slug is reserved.
  const checkoutReady = book.availability === 'available'
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/store" className="inline-flex items-center gap-1 text-sm text-royal-600 hover:underline"><ArrowLeft size={16} /> All books</Link>
      <div className="grid md:grid-cols-[320px_1fr] gap-10 mt-6">
        <img src={book.coverUrl} alt={`Cover of ${book.title}`} width={400} height={533} className="rounded-xl shadow-xl ring-1 ring-gold-400/50 w-full max-w-sm justify-self-center" />
        <div>
          <p className="text-xs tracking-widest text-gold-600">{book.category.toUpperCase()}</p>
          <h1 className="font-display text-4xl text-royal-800 mt-1">{book.title}</h1>
          <p className="text-royal-500 mt-1">by {book.author}</p>
          <p className="mt-5 text-royal-800 leading-relaxed">{book.description}</p>
          <ul className="mt-5 text-sm text-royal-700 space-y-1">
            <li className="flex items-center gap-2"><FileText size={16} className="text-gold-500" /> Format: {book.format}</li>
            <li>Instant download after payment is confirmed</li>
          </ul>
          <p className="mt-6 text-3xl font-semibold text-gold-600">
            {book.salePriceCents && <s className="text-royal-300 text-lg mr-2">{formatZAR(book.priceCents)}</s>}{formatZAR(currentPrice(book))}
          </p>
          {checkoutReady
            ? <Link to={`/checkout/${book.slug}`} className="inline-flex items-center gap-2 mt-4 rounded-full bg-gold-500 hover:bg-gold-400 text-royal-900 font-semibold px-8 py-3"><ShoppingCart size={18} /> Buy Now</Link>
            : <><button disabled className="inline-flex items-center gap-2 mt-4 rounded-full bg-royal-200 text-royal-500 font-semibold px-8 py-3 cursor-not-allowed"><ShoppingCart size={18} /> Buy Now</button>
               <p className="text-xs text-royal-500 mt-2">{book.availability === 'coming_soon' ? 'This book is coming soon.' : 'This book is currently not available.'}</p></>}
        </div>
      </div>
    </section>
  )
}
