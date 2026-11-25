import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/** Branded splash. Plays on every full page load (refresh or new visit), about 1.4 seconds. */
export default function SplashLogo() {
  const [show, setShow] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1400)
    return () => clearTimeout(t)
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-gradient-to-br from-royal-900 via-royal-800 to-royal-700"
          initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} aria-hidden="true">
          <div className="text-center">
            <img src="/brand/logo.webp" alt="" width={200} height={200} className="ag-logo-pulse mx-auto" />
            <p className="mt-4 font-display text-gold-300 tracking-[.3em] text-sm">ABBA GRACE E-BOOK STORE</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
