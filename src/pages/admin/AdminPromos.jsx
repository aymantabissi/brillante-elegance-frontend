import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const toastStyle = {
  background: '#1c1917',
  color: '#fff',
  fontSize: '13px',
  borderRadius: '12px',
  padding: '12px 16px',
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function AdminPromos() {
  const [promos,   setPromos]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form, setForm] = useState({
    code: generateCode(), discount: 10, maxUses: 100, expiresAt: ''
  })

  const fetchPromos = async function() {
    setLoading(true)
    try {
      const res = await api.get('/promos')
      setPromos(res.data)
    } catch(e) {
      toast.error('Erreur chargement')
    }
    setLoading(false)
  }

  useEffect(function() { fetchPromos() }, [])

  const handleCreate = async function() {
    if (!form.code || !form.discount) return toast.error('Code et remise requis')
    setSaving(true)
    try {
      await api.post('/promos', form)
      toast.success('Code cree !', { style: toastStyle })
      setForm({ code: generateCode(), discount: 10, maxUses: 100, expiresAt: '' })
      setShowForm(false)
      fetchPromos()
    } catch(e) {
      toast.error(e.response?.data?.message || 'Erreur')
    }
    setSaving(false)
  }

  const handleDelete = async function(id) {
    if (!window.confirm('Supprimer ce code ?')) return
    try {
      await api.delete('/promos/' + id)
      toast.success('Supprime !', { style: toastStyle })
      fetchPromos()
    } catch(e) {
      toast.error('Erreur')
    }
  }

  const handleToggle = async function(id) {
    try {
      await api.put('/promos/' + id + '/toggle')
      fetchPromos()
    } catch(e) {
      toast.error('Erreur')
    }
  }

  const handleCopy = function(code) {
    navigator.clipboard.writeText(code)
    toast.success('Code copie !', { icon: '📋', style: toastStyle })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800">Codes Promo</h2>
          <p className="text-xs text-stone-400 mt-1">{promos.length} codes au total</p>
        </div>
        <button
          onClick={function() { setShowForm(!showForm) }}
          className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-3 rounded-full hover:bg-stone-700 transition"
        >
          <Plus size={15} /> Nouveau code
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6 shadow-sm">
          <h3 className="text-sm font-medium tracking-widest uppercase text-stone-700 mb-5">Nouveau code promo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="text-xs text-stone-400 block mb-1">Code *</label>
              <div className="flex gap-2">
                <input
                  value={form.code}
                  onChange={function(e) { setForm({ ...form, code: e.target.value.toUpperCase() }) }}
                  className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-stone-400 bg-[#faf9f7] uppercase tracking-widest"
                  placeholder="BRILLANTE20"
                />
                <button
                  onClick={function() { setForm({ ...form, code: generateCode() }) }}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs text-stone-600 transition"
                  title="Generer un code aleatoire"
                >
                  🔀
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Remise (%) *</label>
              <input
                type="number" min="1" max="100"
                value={form.discount}
                onChange={function(e) { setForm({ ...form, discount: e.target.value }) }}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                placeholder="15"
              />
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Utilisations max</label>
              <input
                type="number" min="1"
                value={form.maxUses}
                onChange={function(e) { setForm({ ...form, maxUses: e.target.value }) }}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                placeholder="100"
              />
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Date expiration (optionnel)</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={function(e) { setForm({ ...form, expiresAt: e.target.value }) }}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-stone-100">
            <button onClick={function() { setShowForm(false) }} className="text-sm text-stone-400 hover:text-stone-700 transition px-5 py-2.5">
              Annuler
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-stone-700 transition disabled:opacity-50"
            >
              {saving ? 'Creation...' : 'Creer le code'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs tracking-widest uppercase text-stone-400">
              <tr>
                <th className="px-6 py-3 text-left">Code</th>
                <th className="px-6 py-3 text-left">Remise</th>
                <th className="px-6 py-3 text-left">Utilisations</th>
                <th className="px-6 py-3 text-left">Expiration</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-stone-400">Chargement...</td>
                </tr>
              )}
              {!loading && promos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-stone-400">Aucun code promo — crez votre premier code !</td>
                </tr>
              )}
              {!loading && promos.map(function(p) {
                const expired = p.expiresAt && new Date() > new Date(p.expiresAt)
                const epuise  = p.usedCount >= p.maxUses
                const pid = p._id
                return (
                  <tr key={pid} className="border-t border-stone-50 hover:bg-stone-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-800 tracking-widest">{p.code}</span>
                        <button
                          onClick={function() { handleCopy(p.code) }}
                          className="p-1 text-stone-400 hover:text-stone-700 transition"
                          title="Copier"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        -{p.discount}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className={p.usedCount >= p.maxUses ? 'text-red-500 font-medium' : 'text-stone-600'}>
                        {p.usedCount} / {p.maxUses}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500">
                      {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {expired ? (
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">Expire</span>
                      ) : epuise ? (
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">Epuise</span>
                      ) : p.active ? (
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">Actif</span>
                      ) : (
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">Inactif</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={function() { handleToggle(pid) }}
                          className={'p-1.5 rounded-lg transition ' + (p.active ? 'text-green-500 hover:bg-green-50' : 'text-stone-400 hover:bg-stone-100')}
                          title={p.active ? 'Desactiver' : 'Activer'}
                        >
                          {p.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={function() { handleDelete(pid) }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}