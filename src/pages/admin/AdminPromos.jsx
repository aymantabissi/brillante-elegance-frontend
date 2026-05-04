import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Copy, X, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProducts } from '../../store/slices/productSlice'

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

const emptyForm = {
  code: generateCode(), discount: 10, maxUses: 100, expiresAt: '',
  scope: 'all', // 'all' ou 'specific'
  products: [], // IDs des produits sélectionnés
}

export default function AdminPromos() {
  const dispatch = useDispatch()
  const { items: allProducts } = useSelector((state) => state.products)

  const [promos,      setPromos]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [form,        setForm]        = useState(emptyForm)
  const [searchProd,  setSearchProd]  = useState('')

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

  useEffect(function() {
    fetchPromos()
    dispatch(fetchProducts())
  }, [dispatch])

  const toggleProduct = function(productId) {
    setForm(function(prev) {
      const already = prev.products.includes(productId)
      return {
        ...prev,
        products: already
          ? prev.products.filter(function(id) { return id !== productId })
          : [...prev.products, productId]
      }
    })
  }

  const handleCreate = async function() {
    if (!form.code || !form.discount) return toast.error('Code et remise requis')
    if (form.scope === 'specific' && form.products.length === 0) {
      return toast.error('Sélectionnez au moins un produit')
    }
    setSaving(true)
    try {
      await api.post('/promos', {
        code:     form.code,
        discount: form.discount,
        maxUses:  form.maxUses,
        expiresAt: form.expiresAt,
        products: form.scope === 'specific' ? form.products : [],
      })
      toast.success('Code créé !', { style: toastStyle })
      setForm({ ...emptyForm, code: generateCode() })
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
      toast.success('Supprimé !', { style: toastStyle })
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
    toast.success('Code copié !', { icon: '📋', style: toastStyle })
  }

  const filteredProducts = allProducts.filter(function(p) {
    return p.name.toLowerCase().includes(searchProd.toLowerCase())
  })

  const getProductName = function(id) {
    const p = allProducts.find(function(p) { return p._id === id })
    return p ? p.name : id
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800">Codes Promo</h2>
          <p className="text-xs text-stone-400 mt-1">{promos.length} codes au total</p>
        </div>
        <button
          onClick={function() { setForm({ ...emptyForm, code: generateCode() }); setShowForm(!showForm) }}
          className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-3 rounded-full hover:bg-stone-700 transition"
        >
          <Plus size={15} /> Nouveau code
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-medium tracking-widest uppercase text-stone-700">Nouveau code promo</h3>
            <button onClick={function() { setShowForm(false) }}>
              <X size={16} className="text-stone-400 hover:text-stone-700" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

            {/* Code */}
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
                  title="Générer un code aléatoire"
                >🔀</button>
              </div>
            </div>

            {/* Remise */}
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

            {/* Utilisations max */}
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

            {/* Expiration */}
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

          {/* Scope — tous ou produits spécifiques */}
          <div className="mb-5">
            <label className="text-xs text-stone-400 block mb-2">Applicable sur *</label>
            <div className="flex gap-3">
              <button
                onClick={function() { setForm({ ...form, scope: 'all', products: [] }) }}
                className={'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition ' + (form.scope === 'all' ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400')}
              >
                🛍️ Tous les produits
              </button>
              <button
                onClick={function() { setForm({ ...form, scope: 'specific' }) }}
                className={'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition ' + (form.scope === 'specific' ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400')}
              >
                <Package size={14} /> Produits spécifiques
              </button>
            </div>
          </div>

          {/* Sélection produits */}
          {form.scope === 'specific' && (
            <div className="mb-5">
              <label className="text-xs text-stone-400 block mb-2">
                Sélectionner les produits ({form.products.length} sélectionné{form.products.length > 1 ? 's' : ''})
              </label>

              {/* Produits sélectionnés */}
              {form.products.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.products.map(function(id) {
                    return (
                      <span key={id} className="flex items-center gap-1.5 bg-stone-900 text-white text-xs px-3 py-1.5 rounded-full">
                        {getProductName(id).substring(0, 25)}{getProductName(id).length > 25 ? '...' : ''}
                        <button onClick={function() { toggleProduct(id) }} className="hover:text-red-300 transition">
                          <X size={11} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}

              {/* Search produits */}
              <input
                type="text"
                value={searchProd}
                onChange={function(e) { setSearchProd(e.target.value) }}
                placeholder="Rechercher un produit..."
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7] mb-2"
              />

              {/* Liste produits */}
              <div className="border border-stone-100 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                {filteredProducts.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-4">Aucun produit</p>
                )}
                {filteredProducts.map(function(p) {
                  const selected = form.products.includes(p._id)
                  return (
                    <button
                      key={p._id}
                      onClick={function() { toggleProduct(p._id) }}
                      className={'w-full flex items-center gap-3 px-4 py-3 text-left transition border-b border-stone-50 last:border-0 ' + (selected ? 'bg-stone-50' : 'hover:bg-stone-50')}
                    >
                      <div className={'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition ' + (selected ? 'bg-stone-900 border-stone-900' : 'border-stone-300')}>
                        {selected && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <img
                        src={p.image && p.image.startsWith('http') ? p.image : 'https://via.placeholder.com/32'}
                        alt={p.name}
                        className="w-8 h-8 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-stone-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-stone-400">{p.price} MAD · {p.category}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {form.products.length === 0 && (
                <p className="text-[11px] text-amber-600 mt-2">⚠️ Sélectionnez au moins un produit</p>
              )}
            </div>
          )}

          {/* Info scope */}
          {form.scope === 'all' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-xs text-blue-600">
              🛍️ Ce code sera valable sur <strong>tous les produits</strong> de la boutique.
            </div>
          )}
          {form.scope === 'specific' && form.products.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 text-xs text-amber-700">
              📦 Ce code sera valable uniquement sur les <strong>{form.products.length} produit{form.products.length > 1 ? 's' : ''}</strong> sélectionné{form.products.length > 1 ? 's' : ''}.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-5 border-t border-stone-100">
            <button onClick={function() { setShowForm(false) }} className="text-sm text-stone-400 hover:text-stone-700 transition px-5 py-2.5">
              Annuler
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-stone-700 transition disabled:opacity-50"
            >
              {saving ? 'Création...' : 'Créer le code'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs tracking-widest uppercase text-stone-400">
              <tr>
                <th className="px-6 py-3 text-left">Code</th>
                <th className="px-6 py-3 text-left">Remise</th>
                <th className="px-6 py-3 text-left">Produits</th>
                <th className="px-6 py-3 text-left">Utilisations</th>
                <th className="px-6 py-3 text-left">Expiration</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-stone-400">Chargement...</td>
                </tr>
              )}
              {!loading && promos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-stone-400">Aucun code promo — créez votre premier code !</td>
                </tr>
              )}
              {!loading && promos.map(function(p) {
                const expired = p.expiresAt && new Date() > new Date(p.expiresAt)
                const epuise  = p.usedCount >= p.maxUses
                const pid     = p._id
                const hasSpecificProducts = p.products && p.products.length > 0
                return (
                  <tr key={pid} className="border-t border-stone-50 hover:bg-stone-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-800 tracking-widest">{p.code}</span>
                        <button onClick={function() { handleCopy(p.code) }} className="p-1 text-stone-400 hover:text-stone-700 transition" title="Copier">
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        -{p.discount}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasSpecificProducts ? (
                        <span className="text-xs text-stone-600 flex items-center gap-1">
                          <Package size={11} className="text-stone-400" />
                          {p.products.length} produit{p.products.length > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">Tous</span>
                      )}
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
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">Expiré</span>
                      ) : epuise ? (
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">Épuisé</span>
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
                          title={p.active ? 'Désactiver' : 'Activer'}
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