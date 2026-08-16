import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, X, Check, Eye, Star } from 'lucide-react'
import { createProduct, updateProduct, deleteProduct } from '../../services/productService'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../../store/slices/productSlice'
import toast from 'react-hot-toast'
import { PLACEHOLDER_IMAGE, onImgError } from '../../utils/imageFallback'
import ConfirmDialog from '../../components/ConfirmDialog'

const toastStyle = {
  background: '#1c1917', color: '#fff',
  fontSize: '13px', borderRadius: '12px', padding: '12px 16px',
}

const emptyProduct = {
  name: '', price: '', oldPrice: '', category: 'colliers',
  description: '', image: '', images: [], stock: '', hot: false, discount: '',
  featured: false,
  hasVariants: false,
  variants: [],
}

export default function AdminProducts() {
  const dispatch = useDispatch()
  const { items: products, loading } = useSelector((state) => state.products)

  const [showForm,       setShowForm]       = useState(false)
  const [form,           setForm]           = useState(emptyProduct)
  const [editId,         setEditId]         = useState(null)
  const [saving,         setSaving]         = useState(false)
  const [search,         setSearch]         = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState(null)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [deleteTarget,   setDeleteTarget]   = useState(null)

  const getImageUrl = function(image) {
    if (!image) return PLACEHOLDER_IMAGE
    if (image.startsWith('/uploads')) return 'http://localhost:5000' + image
    return image
  }

  // =====================================================
  // REMISE — calcul automatique à partir de prix / ancien prix
  // =====================================================
  useEffect(function() {
    const price    = Number(form.price)
    const oldPrice = Number(form.oldPrice)

    if (oldPrice > 0 && price > 0 && oldPrice > price) {
      const percent = Math.round(((oldPrice - price) / oldPrice) * 100)
      if (percent !== Number(form.discount)) {
        setForm(function(prev) { return { ...prev, discount: percent } })
      }
    } else if (form.discount !== '' && form.discount !== 0) {
      // Pas d'ancien prix valide (ou ancien prix <= prix) => pas de remise
      setForm(function(prev) { return { ...prev, discount: '' } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.price, form.oldPrice])

  // =====================================================
  // UPLOAD — helper commun (renvoie l'URL uploadée)
  // =====================================================
  const uploadImageFile = async function(file) {
    const formData = new FormData()
    formData.append('image', file)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

    const response = await fetch(apiUrl + '/products/upload', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user'))?.token,
      },
      body: formData,
    })

    const data = await response.json()

    if (!data.imageUrl) {
      throw new Error('Upload échoué')
    }

    return data.imageUrl
  }

  // =====================================================
  // UPLOAD — image principale du produit
  // =====================================================
  const handleImageUpload = async function(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const imageUrl = await uploadImageFile(file)
      setForm(function(prev) { return { ...prev, image: imageUrl } })
      toast.success('Image uploadée !', { style: toastStyle })
    } catch (err) {
      toast.error('Erreur upload image')
    }
    setUploadingImage(false)
  }

  // =====================================================
  // UPLOAD — images supplémentaires (galerie)
  // =====================================================
  const handleGalleryUpload = async function(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingGallery(true)
    try {
      const uploadedUrls = await Promise.all(files.map(uploadImageFile))
      setForm(function(prev) { return { ...prev, images: [...prev.images, ...uploadedUrls] } })
      toast.success(uploadedUrls.length > 1 ? 'Images ajoutées !' : 'Image ajoutée !', { style: toastStyle })
    } catch (err) {
      toast.error('Erreur upload galerie')
    }
    setUploadingGallery(false)
    e.target.value = ''
  }

  const removeGalleryImage = function(index) {
    setForm(function(prev) { return { ...prev, images: prev.images.filter(function(_, i) { return i !== index }) } })
  }

  // =====================================================
  // UPLOAD — image d'une variante précise
  // =====================================================
  const handleVariantImageUpload = async function(index, e) {
    const file = e.target.files[0]
    if (!file) return

    setUploadingVariantIndex(index)
    try {
      const imageUrl = await uploadImageFile(file)
      updateVariant(index, 'image', imageUrl)
      toast.success('Image de la variante uploadée !', { style: toastStyle })
    } catch (err) {
      toast.error('Erreur upload image variante')
    }
    setUploadingVariantIndex(null)
  }

  useEffect(function() { dispatch(fetchProducts()) }, [dispatch])

  const filtered = products.filter(function(p) {
    return p.name.toLowerCase().includes(search.toLowerCase())
  })

  // =====================================================
  // VARIANTS HELPERS
  // =====================================================
  const addVariant = function() {
    setForm({
      ...form,
      variants: [...form.variants, { label: '', price: '', stock: '', image: '' }],
    })
  }

  const updateVariant = function(index, field, value) {
    setForm(function(prev) {
      const updated = [...prev.variants]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, variants: updated }
    })
  }

  const removeVariant = function(index) {
    setForm({
      ...form,
      variants: form.variants.filter(function(_, i) { return i !== index }),
    })
  }

  const handleSave = async function() {
    if (!form.name || !form.price) return toast.error('Nom et prix requis')

    // Ila featured — hda featured dyal produits khrin
    if (form.featured && !editId) {
      const alreadyFeatured = products.find(function(p) { return p.featured })
      if (alreadyFeatured) {
        await updateProduct(alreadyFeatured._id, { ...alreadyFeatured, featured: false })
      }
    } else if (form.featured && editId) {
      const alreadyFeatured = products.find(function(p) { return p.featured && p._id !== editId })
      if (alreadyFeatured) {
        await updateProduct(alreadyFeatured._id, { ...alreadyFeatured, featured: false })
      }
    }

    setSaving(true)
    try {
      if (editId) {
        await updateProduct(editId, form)
        toast.success('Produit modifié !', { style: toastStyle })
      } else {
        await createProduct(form)
        toast.success('Produit ajouté !', { style: toastStyle })
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
    setForm({
      ...emptyProduct,
      ...p,
      variants: p.variants || [],
      hasVariants: p.hasVariants || false,
      images: p.images || [],
    })
    setEditId(p._id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = function(id) {
    setDeleteTarget(id)
  }

  const confirmDelete = async function() {
    const id = deleteTarget
    setDeleteTarget(null)
    try {
      await deleteProduct(id)
      toast.success('Supprimé !', { style: toastStyle })
      dispatch(fetchProducts())
    } catch(e) {
      toast.error('Erreur')
    }
  }

  const handleToggleFeatured = async function(p) {
    try {
      // Hda featured dyal produit khour ila kain
      if (!p.featured) {
        const alreadyFeatured = products.find(function(x) { return x.featured && x._id !== p._id })
        if (alreadyFeatured) {
          await updateProduct(alreadyFeatured._id, { ...alreadyFeatured, featured: false })
        }
      }
      await updateProduct(p._id, { ...p, featured: !p.featured })
      toast.success(p.featured ? 'Retiré de la vitrine' : '⭐ Affiché en vedette !', { style: toastStyle })
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

  const featuredProduct = products.find(function(p) { return p.featured })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light tracking-widest uppercase text-stone-800 dark:text-stone-100">Produits</h2>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">{products.length} produits au total</p>
        </div>
        <button
          onClick={function() { setForm(emptyProduct); setEditId(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-3 rounded-full hover:bg-stone-700 transition"
        >
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {/* Produit vedette actuel */}
      {featuredProduct && !showForm && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <img src={getImageUrl(featuredProduct.image)} alt={featuredProduct.name} className="w-12 h-12 object-cover rounded-xl flex-shrink-0" onError={onImgError} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium tracking-widest uppercase mb-0.5">⭐ Produit vedette — Affiché en page d'accueil</p>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{featuredProduct.name}</p>
          </div>
          <button
            onClick={function() { handleEdit(featuredProduct) }}
            className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 border border-amber-300 dark:border-amber-700 px-3 py-1.5 rounded-full transition whitespace-nowrap"
          >
            Modifier
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium tracking-widest uppercase text-stone-700 dark:text-stone-300">
              {editId ? 'Modifier le produit' : 'Nouveau produit'}
            </h3>
            <button onClick={handleCancel}>
              <X size={18} className="text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Nom du produit *</label>
              <input
                value={form.name}
                onChange={function(e) { setForm({ ...form, name: e.target.value }) }}
                className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                placeholder="Ex: Pack Vancleef Gold" />
            </div>

            <div>
              <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Prix (MAD) *</label>
              <input
                type="number" value={form.price}
                onChange={function(e) { setForm({ ...form, price: e.target.value }) }}
                className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                placeholder="299" />
            </div>

            <div>
              <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Ancien prix (MAD)</label>
              <input
                type="number" value={form.oldPrice}
                onChange={function(e) { setForm({ ...form, oldPrice: e.target.value }) }}
                className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                placeholder="370" />
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Laisser vide si pas de promotion</p>
            </div>

            <div>
              <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Catégorie</label>
              <select
                value={form.category}
                onChange={function(e) { setForm({ ...form, category: e.target.value }) }}
                className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100">
                {['colliers','bracelets','bagues','lunettes','montres','Sacs','autres'].map(function(c) {
                  return <option key={c} value={c}>{c}</option>
                })}
              </select>
            </div>

            <div>
              <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Stock</label>
              <input
                type="number" value={form.stock}
                onChange={function(e) { setForm({ ...form, stock: e.target.value }) }}
                className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                placeholder="10" />
            </div>

            <div>
              <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">
                Remise <span className="text-stone-300 dark:text-stone-600">(calculée automatiquement)</span>
              </label>
              <div className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-between">
                <span>{form.discount !== '' && form.discount !== 0 ? '-' + form.discount + '%' : 'Aucune remise'}</span>
                {form.discount !== '' && form.discount !== 0 && (
                  <span className="text-red-500 text-xs font-semibold">-{form.discount}%</span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Basée sur Prix vs Ancien prix</p>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Image du produit (image principale)</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs tracking-widest uppercase px-5 py-3 rounded-xl transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Choisir une image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                {uploadingImage && <span className="text-xs text-stone-400 dark:text-stone-500">Upload en cours...</span>}
              </div>
              {form.image && (
                <div className="mt-3 relative w-fit">
                  <img
                    src={form.image.startsWith('/uploads') ? 'http://localhost:5000' + form.image : form.image}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded-xl border border-stone-200 dark:border-stone-700"
                  />
                  <button
                    onClick={function() { setForm({ ...form, image: '' }) }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition"
                  >×</button>
                </div>
              )}
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2">JPG, PNG, WEBP — max 5MB</p>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Galerie (images supplémentaires)</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs tracking-widest uppercase px-5 py-3 rounded-xl transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Ajouter des photos
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                </label>
                {uploadingGallery && <span className="text-xs text-stone-400 dark:text-stone-500">Upload en cours...</span>}
              </div>
              {form.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {form.images.map(function(img, i) {
                    return (
                      <div key={i} className="relative w-fit">
                        <img
                          src={img.startsWith('/uploads') ? 'http://localhost:5000' + img : img}
                          alt={'galerie ' + (i + 1)}
                          className="w-20 h-20 object-cover rounded-xl border border-stone-200 dark:border-stone-700"
                        />
                        <button
                          onClick={function() { removeGalleryImage(i) }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition"
                        >×</button>
                      </div>
                    )
                  })}
                </div>
              )}
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2">Plusieurs photos sous différents angles — affichées en galerie sur la fiche produit</p>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={function(e) { setForm({ ...form, description: e.target.value }) }}
                rows={3}
                className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100 resize-none"
                placeholder="Description du produit..." />
            </div>

            {/* Options */}
            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" id="hot"
                  checked={form.hot}
                  onChange={function(e) { setForm({ ...form, hot: e.target.checked }) }}
                  className="accent-stone-900 w-4 h-4" />
                <span className="text-sm text-stone-600 dark:text-stone-400">Marquer comme POPULAIRE</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" id="featured"
                  checked={form.featured}
                  onChange={function(e) { setForm({ ...form, featured: e.target.checked }) }}
                  className="accent-amber-500 w-4 h-4" />
                <span className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1">
                  <Star size={13} className="text-amber-500" />
                  Afficher en vedette (page d'accueil)
                </span>
              </label>
            </div>

            {form.featured && (
              <div className="sm:col-span-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
                ⭐ Ce produit sera affiché dans la section <strong>"Coup de Cœur"</strong> de la page d'accueil. L'ancien produit vedette sera automatiquement retiré.
              </div>
            )}

            {/* ===================================================
                VARIANTES (avec image par variante)
            =================================================== */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={form.hasVariants}
                  onChange={function(e) { setForm({ ...form, hasVariants: e.target.checked }) }}
                  className="accent-stone-900 w-4 h-4" />
                <span className="text-sm text-stone-600 dark:text-stone-400">Ce produit a des variantes (couleur, taille...)</span>
              </label>

              {form.hasVariants && (
                <div className="border border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-4 bg-[#faf9f7] dark:bg-stone-800/50">
                  {form.variants.length === 0 && (
                    <p className="text-xs text-stone-400 dark:text-stone-500 text-center py-2">Aucune variante ajoutée</p>
                  )}

                  {form.variants.map(function(v, i) {
                    return (
                      <div key={i} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3 space-y-3">

                        {/* Ligne infos */}
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            value={v.label}
                            onChange={function(e) { updateVariant(i, 'label', e.target.value) }}
                            placeholder="Ex: Rouge / Taille M"
                            className="flex-1 min-w-[120px] border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100" />
                          <input
                            type="number"
                            value={v.price}
                            onChange={function(e) { updateVariant(i, 'price', e.target.value) }}
                            placeholder="Prix (vide = prix de base)"
                            className="w-36 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100" />
                          <input
                            type="number"
                            value={v.stock}
                            onChange={function(e) { updateVariant(i, 'stock', e.target.value) }}
                            placeholder="Stock"
                            className="w-24 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100" />
                          <button
                            type="button"
                            onClick={function() { removeVariant(i) }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Ligne image de la variante */}
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer flex items-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] tracking-wide uppercase px-3 py-2 rounded-lg transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Photo de cette variante
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={function(e) { handleVariantImageUpload(i, e) }} />
                          </label>

                          {uploadingVariantIndex === i && (
                            <span className="text-[11px] text-stone-400 dark:text-stone-500">Upload en cours...</span>
                          )}

                          {v.image && (
                            <div className="relative w-fit">
                              <img
                                src={v.image.startsWith('/uploads') ? 'http://localhost:5000' + v.image : v.image}
                                alt={v.label || 'variante'}
                                className="w-12 h-12 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
                              />
                              <button
                                type="button"
                                onClick={function() { updateVariant(i, 'image', '') }}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 transition"
                              >×</button>
                            </div>
                          )}
                        </div>

                      </div>
                    )
                  })}

                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-dashed border-stone-300 dark:border-stone-600 rounded-lg px-4 py-2 w-full justify-center">
                    <Plus size={13} /> Ajouter une variante
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
            <button onClick={handleCancel} className="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition px-5 py-2.5">
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

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={function(e) { setSearch(e.target.value) }}
          placeholder="Rechercher un produit..."
          className="w-full sm:w-80 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800/50 text-xs tracking-widest uppercase text-stone-400 dark:text-stone-500">
              <tr>
                <th className="px-6 py-3 text-left">Produit</th>
                <th className="px-6 py-3 text-left">Catégorie</th>
                <th className="px-6 py-3 text-left">Prix</th>
                <th className="px-6 py-3 text-left">Stock</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Vedette</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-stone-400 dark:text-stone-500">Chargement...</td>
                </tr>
              )}
              {!loading && filtered.map(function(p) {
                return (
                  <tr key={p._id} className={'border-t border-stone-50 dark:border-stone-800 transition ' + (p.featured ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50')}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(p.image)}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg bg-stone-100 dark:bg-stone-800 flex-shrink-0"
                          onError={onImgError}
                        />
                        <div>
                          <p className="font-medium text-stone-800 dark:text-stone-200 text-xs leading-snug">{p.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {p.hot      && <span className="text-[10px] text-amber-500 font-medium">POPULAIRE</span>}
                            {p.discount > 0 && <span className="text-[10px] text-red-500">-{p.discount}%</span>}
                            {p.featured && <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5"><Star size={9} className="fill-amber-500 text-amber-500" /> Vedette</span>}
                            {p.hasVariants && p.variants?.length > 0 && (
                              <span className="text-[10px] text-blue-500 font-medium">{p.variants.length} variantes</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-500 dark:text-stone-400 capitalize text-xs">{p.category}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-800 dark:text-stone-200 text-xs">{p.price} MAD</p>
                      {p.oldPrice > 0 && <p className="text-stone-400 dark:text-stone-500 text-[10px] line-through">{p.oldPrice} MAD</p>}
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-600 dark:text-stone-400">{p.stock}</td>
                    <td className="px-6 py-4">
                      <span className={'text-[11px] font-medium px-2.5 py-1 rounded-full ' + (p.stock > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400')}>
                        {p.stock > 0 ? 'En stock' : 'Rupture'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={function() { handleToggleFeatured(p) }}
                        title={p.featured ? 'Retirer de la vedette' : 'Mettre en vedette'}
                        className={'p-1.5 rounded-lg transition ' + (p.featured ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50' : 'text-stone-300 dark:text-stone-600 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20')}
                      >
                        <Star size={16} className={p.featured ? 'fill-amber-500' : ''} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={function() { window.open('/shop', '_blank') }}
                          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition"
                          title="Voir"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={function() { handleEdit(p) }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-stone-400 dark:text-stone-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={function() { handleDelete(p._id) }}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 transition"
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
                  <td colSpan={7} className="px-6 py-10 text-center text-stone-400 dark:text-stone-500">Aucun produit</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer ce produit ?"
        message="Cette action est irreversible."
        confirmLabel="Supprimer"
        danger
        onConfirm={confirmDelete}
        onCancel={function() { setDeleteTarget(null) }}
      />
    </div>
  )
}