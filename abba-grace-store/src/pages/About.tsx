import { Link } from 'react-router-dom'
import { SITE } from '../data/site'

export default function About() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl text-royal-800">About Us</h1>
      <p className="text-gold-600 tracking-widest text-xs mt-2">{SITE.churchName.toUpperCase()}</p>

      <div className="grid md:grid-cols-[300px_1fr] gap-10 mt-8 items-start">
        <img src="/brand/about-3.webp" alt={`${SITE.founder} kneeling in prayer during a service`} width={300} height={500} className="rounded-xl shadow-xl ring-1 ring-gold-400/50 w-full max-w-xs justify-self-center" />
        <div className="text-royal-800 leading-relaxed space-y-4">
          <p><strong>{SITE.founder}</strong> is the founder and president of {SITE.churchName}.</p>
          <p>The {SITE.storeName} was created to put sound, Christ-centred teaching in your hands. Every book in the store is a spiritual resource, written to guide and teach people how to meditate on God daily, so that your faith grows through the Word and through time spent in His presence.</p>
          <p>Whether you are new to faith or have walked with God for years, these books are meant to help you build a steady daily habit of prayer, reflection and meditation on the Word.</p>
          <Link to="/store" className="inline-block mt-2 rounded-full bg-gold-500 hover:bg-gold-400 text-royal-900 font-semibold px-8 py-3">Browse the bookstore</Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mt-12">
        <img src="/brand/about-1.webp" alt={`${SITE.founder} ministering at ${SITE.churchName}`} width={450} height={600} loading="lazy" className="rounded-xl shadow-lg ring-1 ring-gold-400/40 w-full object-cover" />
        <img src="/brand/about-2.webp" alt={`${SITE.founder} in prayer`} width={450} height={560} loading="lazy" className="rounded-xl shadow-lg ring-1 ring-gold-400/40 w-full object-cover" />
      </div>

      <p className="mt-12 text-sm text-royal-700">Before you buy, please read our <Link to="/terms" className="underline text-royal-600">Terms and Conditions</Link>, <Link to="/privacy" className="underline text-royal-600">Privacy Policy</Link> and <Link to="/refunds" className="underline text-royal-600">Refund and Cancellation Policy</Link>.</p>

      <div id="contact" className="mt-6 rounded-2xl bg-white border border-royal-100 p-6 scroll-mt-24">
        <h2 className="font-display text-2xl text-royal-800">Contact Us</h2>
        <address className="not-italic mt-3 text-royal-700 leading-relaxed">
          <strong>{SITE.churchName}</strong><br />
          {SITE.addressLines.map(l => <span key={l}>{l}<br /></span>)}
          Phone: <a className="text-royal-600 underline" href={`tel:${SITE.phoneLink}`}>{SITE.phone}</a><br />
          Email: <a className="text-royal-600 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </address>
      </div>
    </section>
  )
}
