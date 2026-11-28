import { Link } from 'react-router-dom'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { BookOpen, HeartHandshake, Sparkles } from 'lucide-react'
import { SITE } from '../data/site'

const rise: Variants = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } } }
const fromLeft: Variants = { hidden: { opacity: 0, x: -60 }, show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: 'easeOut' } } }
const fromRight: Variants = { hidden: { opacity: 0, x: 60 }, show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: 'easeOut' } } }
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.18 } } }
const view = { once: true, amount: 0.25 }

// Photo that fades in when scrolled to, floats gently, and zooms slowly inside its frame.
function Photo({ src, alt, w, h, from = rise, delay = 0, className = '' }: { src: string; alt: string; w: number; h: number; from?: Variants; delay?: number; className?: string }) {
  const calm = useReducedMotion()
  return (
    <motion.div variants={from} initial="hidden" whileInView="show" viewport={view} transition={{ delay }} className={className}>
      <motion.div animate={calm ? undefined : { y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
        whileHover={{ scale: 1.03 }} className="overflow-hidden rounded-xl shadow-xl ring-1 ring-gold-400/50">
        <motion.img src={src} alt={alt} width={w} height={h} loading="lazy" className="w-full h-full object-cover"
          animate={calm ? undefined : { scale: [1, 1.08, 1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay }} />
      </motion.div>
    </motion.div>
  )
}

const pillars = [
  { Icon: BookOpen, title: 'Daily meditation', text: 'Books that lead you to sit with God\u2019s Word each day and let it take root.' },
  { Icon: HeartHandshake, title: 'Prayer and growth', text: 'Teaching that builds a steady life of prayer, so your faith grows stronger.' },
  { Icon: Sparkles, title: 'Made for everyone', text: 'Whether you are new to faith or have walked with God for years, there is something here for you.' }
]

export default function About() {
  const calm = useReducedMotion()
  return (
    <>
      {/* Hero banner with moving glow */}
      <section className="relative overflow-hidden bg-gradient-to-br from-royal-900 via-royal-700 to-royal-800 text-white">
        {!calm && <>
          <motion.div aria-hidden className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" animate={{ x: [0, 60, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div aria-hidden className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-royal-400/30 blur-3xl" animate={{ x: [0, -60, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
        </>}
        <motion.div variants={stagger} initial="hidden" animate="show" className="relative mx-auto max-w-4xl px-4 py-20 text-center">
          <motion.p variants={rise} className="text-gold-300 tracking-[.3em] text-xs">{SITE.churchName.toUpperCase()}</motion.p>
          <motion.h1 variants={rise} className="font-display text-4xl md:text-6xl mt-4">About <span className="text-gold-400">Us</span></motion.h1>
          <motion.p variants={rise} className="mt-5 text-royal-100 max-w-2xl mx-auto">A church family sharing the Word of God, and books that help you meet Him every day.</motion.p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        {/* Founder */}
        <div className="grid md:grid-cols-[320px_1fr] gap-10 items-center">
          <Photo src="/brand/about-3.webp" alt={`${SITE.founder} kneeling in prayer during a service`} w={300} h={500} from={fromLeft} className="max-w-xs w-full justify-self-center" />
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={view} className="text-royal-800 leading-relaxed space-y-4">
            <motion.h2 variants={rise} className="font-display text-3xl text-royal-800">{SITE.founder}</motion.h2>
            <motion.p variants={rise}>{SITE.founder} is the founder and president of {SITE.churchName}.</motion.p>
            <motion.p variants={rise}>The {SITE.storeName} was created to put sound, Christ-centred teaching in your hands. Every book in the store is a spiritual resource, written to guide and teach people how to meditate on God daily, so that your faith grows through the Word and through time spent in His presence.</motion.p>
            <motion.p variants={rise}>Whether you are new to faith or have walked with God for years, these books are meant to help you build a steady daily habit of prayer, reflection and meditation on the Word.</motion.p>
            <motion.div variants={rise}><Link to="/store" className="inline-block mt-2 rounded-full bg-gold-500 hover:bg-gold-400 text-royal-900 font-semibold px-8 py-3 transition-transform hover:scale-105">Browse the bookstore</Link></motion.div>
          </motion.div>
        </div>

        {/* Video */}
        <motion.div variants={rise} initial="hidden" whileInView="show" viewport={view} className="mt-16">
          <h2 className="font-display text-3xl text-royal-800 text-center">See and hear the ministry</h2>
          <div className="mt-6 grid md:grid-cols-[1fr_auto] gap-6 items-start">
            <video className="w-full rounded-xl shadow-xl ring-1 ring-gold-400/50 bg-royal-900" src="/brand/about-video.mp4" poster="/brand/about-video-poster.jpg" controls playsInline preload="none" aria-label={`${SITE.founder} ministering`} />
            <video className="w-full md:w-56 rounded-xl shadow-xl ring-1 ring-gold-400/50 bg-royal-900 justify-self-center max-w-[14rem]" src="/brand/about-video-2.mp4" poster="/brand/about-video-2-poster.jpg" controls playsInline preload="none" aria-label="Moments from our services" />
          </div>
        </motion.div>

        {/* Pillars */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={view} className="grid sm:grid-cols-3 gap-5 mt-16">
          {pillars.map(({ Icon, title, text }) => (
            <motion.div key={title} variants={rise} whileHover={{ y: -6 }} className="rounded-2xl bg-white border border-royal-100 p-6 shadow-sm hover:shadow-xl transition-shadow">
              <Icon className="text-gold-500" />
              <h3 className="font-display text-xl text-royal-800 mt-3">{title}</h3>
              <p className="text-sm text-royal-700 mt-2">{text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Photo gallery */}
        <h2 className="font-display text-3xl text-royal-800 text-center mt-16">Moments from our services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Photo src="/brand/about-1.webp" alt={`${SITE.founder} ministering at ${SITE.churchName}`} w={450} h={600} from={fromLeft} className="aspect-[3/4]" />
          <Photo src="/brand/about-2.webp" alt={`${SITE.founder} in prayer`} w={450} h={560} delay={0.15} className="aspect-[3/4]" />
          <Photo src="/brand/about-4.webp" alt={`Preaching at ${SITE.churchName}`} w={450} h={600} delay={0.3} className="aspect-[3/4]" />
          <Photo src="/brand/about-5.webp" alt={`Ministering at ${SITE.churchName}`} w={600} h={400} from={fromRight} delay={0.45} className="aspect-[3/4]" />
        </div>

        <p className="mt-12 text-sm text-royal-700 text-center">Before you buy, please read our <Link to="/terms" className="underline text-royal-600">Terms and Conditions</Link>, <Link to="/privacy" className="underline text-royal-600">Privacy Policy</Link> and <Link to="/refunds" className="underline text-royal-600">Refund and Cancellation Policy</Link>.</p>

        {/* Contact */}
        <motion.div id="contact" variants={rise} initial="hidden" whileInView="show" viewport={view} whileHover={{ boxShadow: '0 0 30px rgba(226,185,79,.45)' }} className="mt-6 rounded-2xl bg-white border border-royal-100 p-6 scroll-mt-24 transition-shadow">
          <h2 className="font-display text-2xl text-royal-800">Contact Us</h2>
          <address className="not-italic mt-3 text-royal-700 leading-relaxed">
            <strong>{SITE.churchName}</strong><br />
            {SITE.addressLines.map(l => <span key={l}>{l}<br /></span>)}
            Phone: <a className="text-royal-600 underline" href={`tel:${SITE.phoneLink}`}>{SITE.phone}</a><br />
            Email: <a className="text-royal-600 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </address>
        </motion.div>
      </section>
    </>
  )
}
