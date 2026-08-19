import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { onImgError } from '../../utils/imageFallback'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'

const toastStyle = {
  background: '#1c1917', color: '#fff',
  fontSize: '13px', borderRadius: '12px', padding: '12px 16px',
}

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
  if (!data.imageUrl) throw new Error('Upload échoué')
  return data.imageUrl
}

export default function AdminHomepage() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingSlot, setUploadingSlot] = useState('')

  const fetchSettings = function() {
    setLoading(true)
    api.get('/settings')
      .then(function(res) { setSettings(res.data) })
      .catch(function() { toast.error('Erreur de chargement', { style: toastStyle }) })
      .finally(function() { setLoading(false) })
  }

  useEffect(function() { fetchSettings() }, [])

  const persist = async function(patch) {
    setSaving(true)
    try {
      const { data } = await api.put('/settings', patch)
      setSettings(data)
      toast.success('Enregistré !', { style: toastStyle })
    } catch {
      toast.error('Erreur lors de l\'enregistrement', { style: toastStyle })
    }
    setSaving(false)
  }

  // ---------- HERO SLIDES ----------
  const updateSlide = function(index, field, value) {
    const next = settings.heroSlides.map(function(s, i) {
      return i === index ? { ...s, [field]: value } : s
    })
    setSettings({ ...settings, heroSlides: next })
  }

  const uploadSlideImage = async function(e, index) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingSlot('hero-' + index)
    try {
      const url = await uploadImageFile(file)
      const next = settings.heroSlides.map(function(s, i) {
        return i === index ? { ...s, image: url } : s
      })
      setSettings({ ...settings, heroSlides: next })
      await persist({ heroSlides: next })
    } catch {
      toast.error('Erreur lors de l\'upload', { style: toastStyle })
    }
    setUploadingSlot('')
    e.target.value = ''
  }

  // ---------- STRIP / INSTAGRAM IMAGE LISTS ----------
  const uploadListImage = async function(e, key, index) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingSlot(key + '-' + index)
    try {
      const url = await uploadImageFile(file)
      const next = [...settings[key]]
      next[index] = url
      setSettings({ ...settings, [key]: next })
      await persist({ [key]: next })
    } catch {
      toast.error('Erreur lors de l\'upload', { style: toastStyle })
    }
    setUploadingSlot('')
    e.target.value = ''
  }

  const addListSlot = function(key) {
    setSettings({ ...settings, [key]: [...settings[key], ''] })
  }

  const removeListSlot = function(key, index) {
    const next = settings[key].filter(function(_, i) { return i !== index })
    setSettings({ ...settings, [key]: next })
    persist({ [key]: next })
  }

  // ---------- PROMO BAR ----------
  const updatePromoBar = function(field, value) {
    setSettings({ ...settings, promoBar: { ...settings.promoBar, [field]: value } })
  }

  if (loading || !settings) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array(4).fill(null).map(function(_, i) {
          return <div key={i} className="h-48 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-light text-stone-900 dark:text-stone-100">Page d'accueil</h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
          Gérez les images du hero, de la bande défilante, du bloc Instagram et le bandeau promo.
        </p>
      </div>

      {/* ================================================
          HERO SLIDER
      ================================================ */}
      <section>
        <h2 className="text-sm font-medium tracking-wide uppercase text-stone-500 dark:text-stone-400 mb-4">Hero — bannière d'accueil</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {settings.heroSlides.map(function(slide, i) {
            const isUploading = uploadingSlot === 'hero-' + i
            return (
              <div key={i} className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden">
                <div className="relative h-40 bg-stone-100 dark:bg-stone-800">
                  {slide.image && <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" onError={onImgError} />}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <label className={'flex items-center gap-2 bg-white text-stone-900 text-xs font-medium px-4 py-2.5 rounded-full cursor-pointer hover:bg-stone-100 transition ' + (isUploading ? 'opacity-60 pointer-events-none' : '')}>
                      <ImagePlus size={14} />
                      {isUploading ? 'Envoi...' : 'Changer'}
                      <input type="file" accept="image/*" className="hidden" onChange={function(e) { uploadSlideImage(e, i) }} />
                    </label>
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <input
                    value={slide.subtitle}
                    onChange={function(e) { updateSlide(i, 'subtitle', e.target.value) }}
                    onBlur={function() { persist({ heroSlides: settings.heroSlides }) }}
                    placeholder="Sous-titre"
                    className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
                  />
                  <input
                    value={slide.title}
                    onChange={function(e) { updateSlide(i, 'title', e.target.value) }}
                    onBlur={function() { persist({ heroSlides: settings.heroSlides }) }}
                    placeholder="Titre"
                    className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm font-medium bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ================================================
          BANDE DEFILANTE
      ================================================ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium tracking-wide uppercase text-stone-500 dark:text-stone-400">Bande défilante</h2>
          <button
            onClick={function() { addListSlot('stripImages') }}
            className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition"
          >
            <Plus size={14} /> Ajouter une image
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {settings.stripImages.map(function(img, i) {
            const isUploading = uploadingSlot === 'stripImages-' + i
            return (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 group">
                {img && <img src={img} alt="" className="w-full h-full object-cover" onError={onImgError} />}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                  <label className={'w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-stone-100 transition ' + (isUploading ? 'opacity-60 pointer-events-none' : '')}>
                    <ImagePlus size={12} className="text-stone-700" />
                    <input type="file" accept="image/*" className="hidden" onChange={function(e) { uploadListImage(e, 'stripImages', i) }} />
                  </label>
                  <button
                    onClick={function() { removeListSlot('stripImages', i) }}
                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
                {isUploading && <div className="absolute inset-0 bg-white/70 dark:bg-stone-900/70 flex items-center justify-center text-[10px] text-stone-500">Envoi...</div>}
              </div>
            )
          })}
        </div>
      </section>

      {/* ================================================
          INSTAGRAM
      ================================================ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium tracking-wide uppercase text-stone-500 dark:text-stone-400">Suivez-nous sur Instagram</h2>
          <button
            onClick={function() { addListSlot('instagramImages') }}
            className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition"
          >
            <Plus size={14} /> Ajouter une image
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {settings.instagramImages.map(function(img, i) {
            const isUploading = uploadingSlot === 'instagramImages-' + i
            return (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 group">
                {img && <img src={img} alt="" className="w-full h-full object-cover" onError={onImgError} />}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                  <label className={'w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-stone-100 transition ' + (isUploading ? 'opacity-60 pointer-events-none' : '')}>
                    <ImagePlus size={12} className="text-stone-700" />
                    <input type="file" accept="image/*" className="hidden" onChange={function(e) { uploadListImage(e, 'instagramImages', i) }} />
                  </label>
                  <button
                    onClick={function() { removeListSlot('instagramImages', i) }}
                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
                {isUploading && <div className="absolute inset-0 bg-white/70 dark:bg-stone-900/70 flex items-center justify-center text-[10px] text-stone-500">Envoi...</div>}
              </div>
            )
          })}
        </div>
        <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-2">
          Si aucune image n'est ajoutée ici, le site affiche automatiquement des photos de vos produits.
        </p>
      </section>

      {/* ================================================
          BANDEAU PROMO
      ================================================ */}
      <section>
        <h2 className="text-sm font-medium tracking-wide uppercase text-stone-500 dark:text-stone-400 mb-4">Bandeau promo (en haut du site)</h2>
        <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-5 flex flex-col gap-4 max-w-xl">
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={settings.promoBar.enabled}
              onChange={function(e) { updatePromoBar('enabled', e.target.checked) }}
              className="accent-stone-900 w-4 h-4"
            />
            <span className="text-sm text-stone-600 dark:text-stone-400">Afficher le bandeau</span>
          </label>

          <div>
            <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Texte</label>
            <input
              value={settings.promoBar.text}
              onChange={function(e) { updatePromoBar('text', e.target.value) }}
              placeholder="SOLDES D'ÉTÉ — -15% sur tous les produits."
              className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
            />
          </div>

          <div>
            <label className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Code promo (laisser vide pour ne pas en afficher)</label>
            <input
              value={settings.promoBar.code}
              onChange={function(e) { updatePromoBar('code', e.target.value.toUpperCase()) }}
              placeholder="FORYOU50"
              className="w-full border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm font-mono uppercase bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
            />
          </div>

          <button
            onClick={function() { persist({ promoBar: settings.promoBar }) }}
            disabled={saving}
            className="self-start bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs tracking-[0.2em] uppercase px-6 py-3 rounded-full hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </section>
    </div>
  )
}
