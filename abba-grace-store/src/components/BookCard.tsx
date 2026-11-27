import { Link } from 'react-router-dom'
import { Book, currentPrice, formatZAR } from '../data/books'

const STATUS = {
  available: ['Available', 'bg-green-100 text-green-800'],
  coming_soon: ['Coming soon', 'bg-amber-100 text-amber-800'],
  unavailable: ['Not available', 'bg-red-100 text-red-800']
} as const

export const BookCardSkeleton = () => (
  <div className="rounded-2xl bg-white p-4 shadow animate-pulse" aria-hidden="true">
    <div className="aspect-[3/4] rounded-xl bg-royal-100" /><div className="h-5 w-3/4 bg-royal-100 rounded mt-4" /><div className="h-4 w-1/2 bg-royal-100 rounded mt-2" /><div className="h-9 bg-royal-100 rounded-full mt-4" />
  </div>
)

export default function BookCard({ book }: { book: Book }) {
  return (
    <article className="group rounded-2xl bg-white p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition border border-royal-100 flex flex-col">
      <Link to={`/store/${book.slug}`} className="block overflow-hidden rounded-xl">
        <img src={book.coverUrl} alt={`Cover of ${book.title}`} width={400} height={533} loading="lazy" className="aspect-[3/4] w-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </Link>
      <h3 className="font-display text-xl text-royal-800 mt-4">{book.title}</h3>
      <p className="text-sm text-royal-500">by {book.author}</p>
      <p className="text-sm text-royal-700 mt-2 flex-1">{book.shortDescription}</p>
      <div className="flex items-center justify-between mt-3">
        <p className="font-semibold text-gold-600 text-lg">
          {book.salePriceCents && <s className="text-royal-300 text-sm mr-2">{formatZAR(book.priceCents)}</s>}{formatZAR(currentPrice(book))}
        </p>
        <span className={`text-xs px-2 py-1 rounded-full ${STATUS[book.availability][1]}`}>{STATUS[book.availability][0]}</span>
      </div>
      <Link to={`/store/${book.slug}`} className="mt-4 text-center rounded-full bg-royal-700 hover:bg-royal-600 text-white py-2.5 text-sm font-medium transition-colors">View Book</Link>
    </article>
  )
}
