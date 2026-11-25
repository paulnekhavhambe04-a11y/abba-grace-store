import { Routes, Route } from 'react-router-dom'
import SplashLogo from './components/SplashLogo'
import Layout from './components/Layout'
import Home from './pages/Home'
import Store from './pages/Store'
import BookPage from './pages/BookPage'
import AdminResetPassword from './pages/admin/AdminResetPassword'
import AdminGuard from './pages/admin/AdminGuard'
import AdminLogin from './pages/admin/AdminLogin'
import AdminBooks from './pages/admin/AdminBooks'

export default function App() {
  return (
    <>
      <SplashLogo />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/store/:slug" element={<BookPage />} />
          <Route path="*" element={<div className="py-24 text-center font-display text-3xl">Page not found</div>} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminGuard />}><Route index element={<AdminBooks />} /></Route>
      </Routes>
    </>
  )
}
