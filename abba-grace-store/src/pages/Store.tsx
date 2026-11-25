import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Book, getBooks } from '../data/books'
import BookCard, { BookCardSkeleton } from '../components/BookCard'

export default function Store() {
  const [books, setBooks] = useState<Book[] | null>(null)
  const [error, setError] = useState(false)
  const [params] = useSearchParams()
  const category = params.get('category')
  useEffect(() => { getBooks().then(setBooks).catch(() => setError(true)) }, [])
  const shown = books?.filter(b => !category || b.category === category)
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl text-royal-800">Bookstore</h1>
      <p className="text-royal-600 mt-2">{category ? `Category: ${category}` : 'All books'}</p>
      {error && <p role="alert" className="mt-6 text-red-700">We couldn't load the books. Please refresh and try again.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {shown ? shown.map(b => <BookCard key={b.id} book={b} />) : [0, 1, 2].map(i => <BookCardSkeleton key={i} />)}
      </div>
      {shown?.length === 0 && <p className="mt-6 text-royal-600">No books in this category yet.</p>}
    </section>
  )
}
