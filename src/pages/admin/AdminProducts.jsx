import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, X, Check, Eye } from 'lucide-react'
import { createProduct, updateProduct, deleteProduct } from '../../services/productService'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../../store/slices/productSlice'
import toast from 'react-hot-toast'

const emptyProduct = {
  name: '', price: '', oldPrice: '', category: 'colliers',
  description: '', image: '', stock: '', hot: false, discount: '',
}

export default function AdminProducts() {
  const dispatch = useDispatch()
  const { items: products, loading } = useSelector((state) => state.products)

  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState(emptyProduct)
  const [editId,   setEditId]   = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [search,   setSearch]   = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)



  const getImageUrl = function(image) {
  if (!image) return 'https://via.placeholder.com/40'
  if (image.startsWith('/uploads')) return 'http://localhost:5000' + image
  return image
}
const handleImageUpload = async function(e) {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)

  setUploadingImage(true)
  try {
    const response = await fetch('http://localhost:5000/api/products/upload', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user'))?.token,
      },
      body: formData,
    })
    const data = await response.json()
    if (data.imageUrl) {
      setForm(function(prev) { return { ...prev, image: data.imageUrl } })
      toast.success('Image uploadee !')
    }
  } catch (err) {
    toast.error('Erreur upload image')
  }
  setUploadingImage(false)
}

  useEffect(function() { dispatch(fetchProducts()) }, [dispatch])

  const filtered = products.filter(function(p) {
    return p.name.toLowerCase().includes(search.toLowerCase())
  })

  const handleSave = async function() {
    if (!form.name || !form.price) return toast.error('Nom et prix requis')
    setSaving(true)
    try {
      if (editId) {
        await updateProduct(editId, form)
        toast.success('Produit modifie !')
      } else {
        await createProduct(form)
        toast.success('Produit ajoute !')
      }
      setShowForm(false)
      setForm(emptyProduct)
      setEditId(null)
      dispatch(fetchProducts())
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur')
    }
    setSaving(false)
  }

  const handleEdit = function(p) {
    setForm({ ...p })
    setEditId(p._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async function(id) {
    if (!window.confirm('Supprimer ce produit ?')) return
    try {
      await deleteProduct(id)
      toast.success('Supprime !')
      dispatch(fetchProducts())
    } catch(e) {
      toast.error('Erreur')
    }
  }

  const handleCancel = function() {
    setShowForm(false)
    setForm(emptyProduct)
    setEditId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800">Produits</h2>
          <p className="text-xs text-stone-400 mt-1">{products.length} produits au total</p>
        </div>
        <button
          onClick={function() { setForm(emptyProduct); setEditId(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-3 rounded-full hover:bg-stone-700 transition"
        >
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium tracking-widest uppercase text-stone-700">
              {editId ? 'Modifier produit' : 'Nouveau produit'}
            </h3>
            <button onClick={handleCancel}>
              <X size={18} className="text-stone-400 hover:text-stone-700" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-stone-400 block mb-1">Nom du produit *</label>
              <input
                value={form.name}
                onChange={function(e) { setForm({ ...form, name: e.target.value }) }}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                placeholder="Ex: Pack Vancleef Gold" />
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Prix (MAD) *</label>
              <input
                type="number" value={form.price}
                onChange={function(e) { setForm({ ...form, price: e.target.value }) }}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                placeholder="299" />
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Ancien prix (MAD)</label>
              <input
                type="number" value={form.oldPrice}
                onChange={function(e) { setForm({ ...form, oldPrice: e.target.value }) }}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                placeholder="370" />
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Categorie</label>
              <select
                value={form.category}
                onChange={function(e) { setForm({ ...form, category: e.target.value }) }}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]">
                {['colliers','bracelets','bagues','lunettes','montres','Sacs','autres'].map(function(c) {
                  return <option key={c} value={c}>{c}</option>
                })}
              </select>
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Stock</label>
              <input
                type="number" value={form.stock}
                onChange={function(e) { setForm({ ...form, stock: e.target.value }) }}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                placeholder="10" />
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">Discount (%)</label>
              <input
                type="number" value={form.discount}
                onChange={function(e) { setForm({ ...form, discount: e.target.value }) }}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7]"
                placeholder="19" />
            </div>

           <div className="sm:col-span-2">
  <label className="text-xs text-stone-400 block mb-1">Image du produit</label>

  {/* Upload Button */}
  <div className="flex items-center gap-4">
    <label className="cursor-pointer flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs tracking-widest uppercase px-5 py-3 rounded-xl transition">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      Choisir une image
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </label>

    {uploadingImage && (
      <span className="text-xs text-stone-400">Upload en cours...</span>
    )}
  </div>

  {/* Preview */}
  {form.image && (
    <div className="mt-3 relative w-fit">
      <img
        src={form.image.startsWith('/uploads') ? 'http://localhost:5000' + form.image : form.image}
        alt="preview"
        className="w-24 h-24 object-cover rounded-xl border border-stone-200"
      />
      <button
        onClick={function() { setForm({ ...form, image: '' }) }}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition"
      >
        x
      </button>
    </div>
  )}

  <p className="text-[11px] text-stone-400 mt-2">JPG, PNG, WEBP — max 5MB</p>
</div>

            <div className="sm:col-span-2">
              <label className="text-xs text-stone-400 block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={function(e) { setForm({ ...form, description: e.target.value }) }}
                rows={3}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 bg-[#faf9f7] resize-none"
                placeholder="Description du produit..." />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox" id="hot"
                checked={form.hot}
                onChange={function(e) { setForm({ ...form, hot: e.target.checked }) }}
                className="accent-stone-900 w-4 h-4" />
              <label htmlFor="hot" className="text-sm text-stone-600">Marquer comme HOT</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-stone-100">
            <button onClick={handleCancel} className="text-sm text-stone-400 hover:text-stone-700 transition px-5 py-2.5">
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:bg-stone-700 transition disabled:opacity-50">
              <Check size={14} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={function(e) { setSearch(e.target.value) }}
          placeholder="Rechercher un produit..."
          className="w-full sm:w-80 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-stone-400 bg-white"
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs tracking-widest uppercase text-stone-400">
              <tr>
                <th className="px-6 py-3 text-left">Produit</th>
                <th className="px-6 py-3 text-left">Categorie</th>
                <th className="px-6 py-3 text-left">Prix</th>
                <th className="px-6 py-3 text-left">Stock</th>
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
              {!loading && filtered.map(function(p) {
                return (
                  <tr key={p._id} className="border-t border-stone-50 hover:bg-stone-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(p.image)}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg bg-stone-100 flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium text-stone-800 text-xs leading-snug">{p.name}</p>
                          {p.hot && <span className="text-[10px] text-amber-500 font-medium">HOT</span>}
                          {p.discount > 0 && <span className="text-[10px] text-red-500 ml-2">-{p.discount}%</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-500 capitalize text-xs">{p.category}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-800 text-xs">{p.price} MAD</p>
                      {p.oldPrice > 0 && <p className="text-stone-400 text-[10px] line-through">{p.oldPrice} MAD</p>}
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-600">{p.stock}</td>
                    <td className="px-6 py-4">
                      <span className={'text-[11px] font-medium px-2.5 py-1 rounded-full ' + (p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                        {p.stock > 0 ? 'En stock' : 'Rupture'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={function() { window.open('/shop', '_blank') }}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
                          title="Voir"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={function() { handleEdit(p) }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-stone-400 hover:text-blue-600 transition"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={function() { handleDelete(p._id) }}
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
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-stone-400">Aucun produit</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}