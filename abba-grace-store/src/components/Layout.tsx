import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Menu, X, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

const nav = [{ to: '/', label: 'Home' }, { to: '/store', label: 'Bookstore' }, { to: '/#about', label: 'About' }, { to: '/#contact', label: 'Contact' }]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  useEffect(() => { setOpen(false); if (hash) document.querySelector(hash)?.scrollIntoView(); else window.scrollTo(0, 0) }, [pathname, hash])
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-royal-800/95 backdrop-blur text-white border-b border-gold-500/40">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Abba Grace E-book Store home">
            <img src="/brand/logo.webp" alt="" width={44} height={44} />
            <span className="font-display text-lg leading-tight">Abba Grace<span className="block text-[10px] tracking-[.3em] text-gold-300 font-sans">E-BOOK STORE</span></span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm" aria-label="Main">
            {nav.map(n => <NavLink key={n.label} to={n.to} className="hover:text-gold-300 transition-colors">{n.label}</NavLink>)}
          </nav>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && <nav className="md:hidden px-4 pb-4 grid gap-3" aria-label="Mobile">{nav.map(n => <Link key={n.label} to={n.to} className="py-1">{n.label}</Link>)}</nav>}
      </header>
      <motion.main className="flex-1" key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .25 }}><Outlet /></motion.main>
      <footer className="bg-royal-900 text-royal-200 mt-16">
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-6 md:grid-cols-3 text-sm">
          <div><img src="/brand/logo.webp" alt="Abba Grace International Church" width={90} height={90} loading="lazy" /></div>
          <div><p className="font-display text-white text-lg mb-2">Abba Grace E-book Store</p><p>Christian books and spiritual resources to strengthen your faith.</p></div>
          <div><p className="text-white mb-2">Contact</p><p className="flex items-center gap-2"><Mail size={14} /> contact@example.com <span className="text-gold-300">(placeholder)</span></p></div>
        </div>
        <p className="text-center text-xs text-royal-300 pb-6">© {new Date().getFullYear()} Abba Grace International Church. All rights reserved.</p>
      </footer>
    </div>
  )
}
