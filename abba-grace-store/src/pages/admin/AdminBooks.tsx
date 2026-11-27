import { useEffect, useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Upload, LogOut, Trash2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Row { id: string; slug: string; title: string; author: string; category: string; short_description: string; description: string
  cover_path: string | null; file_path: string | null; price_cents: number; sale_price_cents: number | null; is_published: boolean; is_featured: boolean; availability: 'available' | 'unavailable' | 'coming_soon' }

const MAX_COVER = 5 * 1024 * 1024, MAX_PDF = 100 * 1024 * 1024
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const rand = () => crypto.randomUUID().slice(0, 8)

const empty = { title: '', author: '', category: 'Devotionals', short_description: '', description: '', price: '', sale: '', published: true, featured: true, availability: 'available' as 'available' | 'unavailable' | 'coming_soon' }

export default function AdminBooks() {
  const nav = useNavigate()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [editing, setEditing] = useState<Row | null>(null)
  const [f, setF] = useState(empty)
  const [cover, setCover] = useState<File | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = async () => {
    const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false })
    if (error) setMsg({ ok: false, text: 'Could not load books.' }); else setRows(data as Row[])
  }
  useEffect(() => { load() }, [])

  const startEdit = (r: Row | null) => {
    setEditing(r); setCover(null); setPdf(null); setMsg(null)
    setF(r ? { title: r.title, author: r.author, category: r.category, short_description: r.short_description, description: r.description,
      price: (r.price_cents / 100).toFixed(2), sale: r.sale_price_cents != null ? (r.sale_price_cents / 100).toFixed(2) : '', published: r.is_published, featured: r.is_featured, availability: r.availability } : empty)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setMsg(null)
    const price = Math.round(parseFloat(f.price) * 100)
    const sale = f.sale.trim() ? Math.round(parseFloat(f.sale) * 100) : null
    if (!f.title.trim() || !f.author.trim()) return setMsg({ ok: false, text: 'Title and author are required.' })
    if (!Number.isFinite(price) || price < 0) return setMsg({ ok: false, text: 'Enter a valid price in Rand, for example 150.00.' })
    if (sale !== null && (!Number.isFinite(sale) || sale < 0 || sale >= price)) return setMsg({ ok: false, text: 'Sale price must be lower than the normal price.' })
    if (cover && (!['image/jpeg', 'image/png', 'image/webp'].includes(cover.type) || cover.size > MAX_COVER)) return setMsg({ ok: false, text: 'Cover must be a JPG, PNG or WebP under 5 MB.' })
    if (pdf && (pdf.type !== 'application/pdf' || pdf.size > MAX_PDF)) return setMsg({ ok: false, text: 'Book file must be a PDF under 100 MB.' })
    if (!editing && !pdf && f.availability === 'available') return setMsg({ ok: false, text: 'Please choose the book PDF.' })

    setBusy(true)
    try {
      let cover_path = editing?.cover_path ?? null, file_path = editing?.file_path ?? null
      if (cover) {
        const ext = cover.type === 'image/png' ? 'png' : cover.type === 'image/webp' ? 'webp' : 'jpg'
        const p = `${rand()}.${ext}`
        const { error } = await supabase.storage.from('covers').upload(p, cover, { contentType: cover.type })
        if (error) throw error
        if (cover_path) await supabase.storage.from('covers').remove([cover_path])
        cover_path = p
      }
      if (pdf) {
        const p = `${rand()}.pdf`
        const { error } = await supabase.storage.from('book-files').upload(p, pdf, { contentType: 'application/pdf' })
        if (error) throw error
        if (file_path) await supabase.storage.from('book-files').remove([file_path])
        file_path = p
      }
      const payload = { title: f.title.trim(), author: f.author.trim(), category: f.category.trim() || 'Devotionals',
        short_description: f.short_description.trim(), description: f.description.trim(), price_cents: price, sale_price_cents: sale,
        is_published: f.published, is_featured: f.featured, availability: f.availability, cover_path, file_path, updated_at: new Date().toISOString() }
      if (f.featured) await supabase.from('books').update({ is_featured: false }).neq('id', editing?.id ?? '00000000-0000-0000-0000-000000000000')
      const { error } = editing
        ? await supabase.from('books').update(payload).eq('id', editing.id)
        : await supabase.from('books').insert({ ...payload, slug: `${slugify(f.title)}-${rand().slice(0, 4)}` })
      if (error) throw error
      setMsg({ ok: true, text: editing ? 'Book updated.' : 'Book added and live on the store.' })
      startEdit(null); await load()
    } catch {
      setMsg({ ok: false, text: 'Something went wrong while saving. Check your connection and try again.' })
    } finally { setBusy(false) }
  }

  const remove = async (r: Row) => {
    if (!confirm(`Delete "${r.title}"? This cannot be undone.`)) return
    setBusy(true)
    if (r.cover_path) await supabase.storage.from('covers').remove([r.cover_path])
    if (r.file_path) await supabase.storage.from('book-files').remove([r.file_path])
    const { error } = await supabase.from('books').delete().eq('id', r.id)
    setBusy(false); setMsg(error ? { ok: false, text: 'Could not delete the book.' } : { ok: true, text: 'Book deleted.' }); load()
  }

  const input = 'mt-1 w-full rounded-lg border border-royal-200 px-3 py-2 bg-white'
  return (
    <div className="min-h-screen bg-ivory">
      <header className="bg-royal-800 text-white">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <span className="font-display">Abba Grace Admin</span>
          <div className="flex items-center gap-4 text-sm"><Link to="/" className="hover:text-gold-300">View store</Link>
            <button onClick={async () => { await supabase.auth.signOut(); nav('/admin/login') }} className="flex items-center gap-1 hover:text-gold-300"><LogOut size={15} /> Sign out</button></div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 grid lg:grid-cols-[1fr_380px] gap-8">
        <section>
          <h1 className="font-display text-2xl text-royal-800">Your books</h1>
          {rows === null ? <p className="mt-4 text-royal-600" aria-busy="true">Loading...</p> : rows.length === 0 ? <p className="mt-4 text-royal-600">No books yet. Add your first one using the form.</p> :
            <ul className="mt-4 space-y-3">{rows.map(r => (
              <li key={r.id} className="bg-white rounded-xl p-4 border border-royal-100 flex items-center justify-between gap-3">
                <div><p className="font-medium text-royal-800">{r.title}</p>
                  <p className="text-xs text-royal-500">R{(r.price_cents / 100).toFixed(2)} · {r.availability === 'available' ? 'Available' : r.availability === 'coming_soon' ? 'Coming soon' : 'Not available'} · {r.is_published ? 'Visible' : 'Hidden'} · {r.file_path ? 'PDF uploaded' : 'No PDF'}</p></div>
                <div className="flex gap-2 text-sm"><button onClick={() => startEdit(r)} className="px-3 py-1 rounded-full border border-royal-300 hover:bg-royal-50">Edit</button>
                  <button onClick={() => remove(r)} aria-label={`Delete ${r.title}`} className="p-2 text-red-700 hover:bg-red-50 rounded-full"><Trash2 size={16} /></button></div>
              </li>))}</ul>}
        </section>
        <form onSubmit={submit} className="bg-white rounded-2xl p-6 border border-royal-100 h-fit">
          <h2 className="font-display text-xl text-royal-800">{editing ? 'Edit book' : 'Add a book'}</h2>
          <label className="block mt-4 text-sm">Title<input className={input} value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required /></label>
          <label className="block mt-3 text-sm">Author<input className={input} value={f.author} onChange={e => setF({ ...f, author: e.target.value })} required /></label>
          <label className="block mt-3 text-sm">Category<input className={input} value={f.category} onChange={e => setF({ ...f, category: e.target.value })} /></label>
          <label className="block mt-3 text-sm">Short description<input className={input} maxLength={160} value={f.short_description} onChange={e => setF({ ...f, short_description: e.target.value })} /></label>
          <label className="block mt-3 text-sm">Full description<textarea rows={5} className={input} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <label className="block text-sm">Price (R)<input inputMode="decimal" className={input} value={f.price} onChange={e => setF({ ...f, price: e.target.value })} placeholder="150.00" required /></label>
            <label className="block text-sm">Sale price (R)<input inputMode="decimal" className={input} value={f.sale} onChange={e => setF({ ...f, sale: e.target.value })} placeholder="optional" /></label>
          </div>
          <label className="block mt-4 text-sm">Availability
            <select className={input} value={f.availability} onChange={e => setF({ ...f, availability: e.target.value as typeof f.availability })}>
              <option value="available">Available (can be bought)</option>
              <option value="coming_soon">Coming soon (cannot be bought yet)</option>
              <option value="unavailable">Not available (cannot be bought)</option>
            </select></label>
          <label className="block mt-4 text-sm">Cover image {editing && '(leave empty to keep current)'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setCover(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm" /></label>
          <label className="block mt-3 text-sm">Book PDF {editing && '(leave empty to keep current)'}
            <input type="file" accept="application/pdf" onChange={e => setPdf(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-sm" /></label>
          <label className="flex items-center gap-2 mt-4 text-sm"><input type="checkbox" checked={f.published} onChange={e => setF({ ...f, published: e.target.checked })} /> Published (visible in store)</label>
          <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={f.featured} onChange={e => setF({ ...f, featured: e.target.checked })} /> Featured on homepage</label>
          {msg && <p role="status" className={`mt-4 text-sm flex items-start gap-2 ${msg.ok ? 'text-green-700' : 'text-red-700'}`}>{msg.ok && <CheckCircle2 size={16} />}{msg.text}</p>}
          <div className="flex gap-2 mt-5">
            <button disabled={busy} className="flex-1 flex items-center justify-center gap-2 rounded-full bg-royal-700 hover:bg-royal-600 text-white py-2.5 disabled:opacity-60">
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Upload size={16} />} {busy ? 'Saving...' : editing ? 'Save changes' : 'Add book'}</button>
            {editing && <button type="button" onClick={() => startEdit(null)} className="px-4 rounded-full border border-royal-300">Cancel</button>}
          </div>
        </form>
      </main>
    </div>
  )
}
