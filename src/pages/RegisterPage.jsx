import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../store/slices/authSlice'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector((state) => state.auth)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password min 6 characters')
    dispatch(registerUser(form))
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-[0.3em] text-stone-800 uppercase">
            Brillante
          </h1>
          <p className="text-xs tracking-[0.4em] text-stone-400 uppercase mt-1">
            Elegance
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-light text-stone-700 mb-6 text-center">
            Créer un compte
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs tracking-widest text-stone-400 uppercase mb-2">
                Nom complet
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7] transition"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest text-stone-400 uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7] transition"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest text-stone-400 uppercase mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-700 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7] transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-800 text-white rounded-xl py-3 text-sm tracking-widest uppercase hover:bg-stone-700 transition disabled:opacity-50"
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          <p className="text-center text-stone-400 text-sm mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-stone-700 underline underline-offset-4">
              Se connecter
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}