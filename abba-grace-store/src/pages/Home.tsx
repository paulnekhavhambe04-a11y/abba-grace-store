import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BookOpen, ShieldCheck, Download } from 'lucide-react'
import { Book, getBooks } from '../data/books'
import BookCard, { BookCardSkeleton } from '../components/BookCard'

export default function Home() {
  const [books, setBooks] = useState<Book[] | null>(null)
  useEffect(() => { getBooks().then(setBooks) }, [])
  const featured = books?.find(b => b.featured)
  const categories = books ? [...new Set(books.map(b => b.category))] : []
  return (
    <>
      <section className="bg-gradient-to-br from-royal-900 via-royal-700 to-royal-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-gold-300 tracking-[.3em] text-xs mb-4">WELCOME TO ABBA GRACE</p>
            <h1 className="font-display text-4xl md:text-6xl leading-tight">Books that inspire. <span className="text-gold-400">Words that transform.</span></h1>
            <p className="mt-5 text-royal-100 max-w-lg">Discover Christian books, teachings and spiritual resources designed to encourage your faith and strengthen your relationship with God.</p>
            <Link to="/store" className="inline-flex items-center gap-2 mt-8 rounded-full bg-gold-500 hover:bg-gold-400 text-royal-900 font-semibold px-7 py-3 transition-colors"><BookOpen size={18} /> Browse the Bookstore</Link>
          </div>
          {featured && <Link to={`/store/${featured.slug}`} className="justify-self-center" aria-label={`View ${featured.title}`}>
            <img src={featured.coverUrl} alt={`Cover of ${featured.title}`} width={340} height={453} className="rounded-xl shadow-2xl ring-1 ring-gold-400/60 rotate-2 hover:rotate-0 transition-transform duration-500 w-64 md:w-80" />
          </Link>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-12 grid sm:grid-cols-3 gap-4 text-sm text-royal-700">
        {[[Download, 'Instant PDF download'], [ShieldCheck, 'Secure checkout via PayFast'], [BookOpen, 'No account needed']].map(([I, t], i) => {
          const Icon = I as typeof BookOpen
          return <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-royal-100"><Icon className="text-gold-500" />{t as string}</div>
        })}
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-16" id="books">
        <h2 className="font-display text-3xl text-royal-800">Available Books</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {books ? books.map(b => <BookCard key={b.id} book={b} />) : <BookCardSkeleton />}
        </div>
        {categories.length > 0 && <div className="mt-10"><h3 className="font-display text-xl text-royal-800">Categories</h3>
          <div className="flex flex-wrap gap-2 mt-3">{categories.map(c => <Link key={c} to={`/store?category=${encodeURIComponent(c)}`} className="px-4 py-1.5 rounded-full border border-gold-500 text-royal-700 hover:bg-gold-300/30 text-sm">{c}</Link>)}</div></div>}
      </section>

      <section id="about" className="mx-auto max-w-4xl px-4 mt-20 text-center scroll-mt-20">
        <h2 className="font-display text-3xl text-royal-800">About Abba Grace</h2>
        <p className="mt-4 text-royal-700">Abba Grace International Church is a community of believers committed to the message of God's grace. This store makes our teachings and devotionals available to you wherever you are. PLACEHOLDER: replace with the church's own description.</p>
      </section>
      <section id="contact" className="mx-auto max-w-4xl px-4 mt-16 text-center scroll-mt-20">
        <h2 className="font-display text-3xl text-royal-800">Contact</h2>
        <p className="mt-4 text-royal-700">Questions about an order? Email <a className="text-royal-600 underline" href="mailto:contact@example.com">contact@example.com</a> (placeholder).</p>
      </section>
    </>
  )
}
