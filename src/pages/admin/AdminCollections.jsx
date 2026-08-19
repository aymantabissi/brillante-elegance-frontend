import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { onImgError } from '../../utils/imageFallback'
import { ImagePlus } from 'lucide-react'

const toastStyle = {
  background: '#1c1917', color: '#fff',
  fontSize: '13px', borderRadius: '12px', padding: '12px 16px',
}

const CATEGORY_OPTIONS = [
  { value: 'colliers',  label: 'Colliers' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'bagues',    label: 'Bagues' },
  { value: 'lunettes',  label: 'Lunettes' },
  { value: 'montres',   label: 'Montres' },
  { value: 'Sacas',     label: 'Sacs' },
  { value: 'autres',    label: 'Autres' },
]

export default function AdminCollections() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingKey, setUploadingKey] = useState(null)

  const fetchCollections = function() {
    setLoading(true)
    api.get('/collections')
      .then(function(res) { setCollections(res.data) })
      .catch(function() { toast.error('Erreur de chargement', { style: toastStyle }) })
      .finally(function() { setLoading(false) })
  }

  useEffect(function() { fetchCollections() }, [])

  const handleImageUpload = async function(e, card) {
    const file = e.target.files[0]
    if (!file) return

    setUploadingKey(card.key)

    try {
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

      const { data: updated } = await api.put('/collections/' + card._id, { image: data.imageUrl })

      setCollections(function(prev) {
        return prev.map(function(c) { return c._id === card._id ? updated : c })
      })

      toast.success('Image mise à jour !', { style: toastStyle })
    } catch {
      toast.error('Erreur lors de l\'upload', { style: toastStyle })
    }

    setUploadingKey(null)
    e.target.value = ''
  }

  const updateLocalField = function(id, field, value) {
    setCollections(function(prev) {
      return prev.map(function(c) { return c._id === id ? { ...c, [field]: value } : c })
    })
  }

  const persistField = async function(id, field, value) {
    try {
      const { data: updated } = await api.put('/collections/' + id, { [field]: value })
      setCollections(function(prev) {
        return prev.map(function(c) { return c._id === id ? updated : c })
      })
    } catch {
      toast.error('Erreur lors de l\'enregistrement', { style: toastStyle })
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-light text-stone-900 dark:text-stone-100">Nos Collections</h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
          Modifiez l'image, le titre et la catégorie liée pour chaque carte de la section "Nos Collections".
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array(4).fill(null).map(function(_, i) {
            return <div key={i} className="h-80 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {collections.map(function(card) {
            const isUploading = uploadingKey === card.key
            return (
              <div key={card._id} className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden">
                <div className="relative h-56 bg-stone-100 dark:bg-stone-800">
                  <img src={card.image} alt={card.label} className="w-full h-full object-cover" onError={onImgError} />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <label className={'flex items-center gap-2 bg-white text-stone-900 text-xs font-medium px-4 py-2.5 rounded-full cursor-pointer hover:bg-stone-100 transition ' + (isUploading ? 'opacity-60 pointer-events-none' : '')}>
                      <ImagePlus size={14} />
                      {isUploading ? 'Envoi...' : 'Changer'}
                      <input type="file" accept="image/*" className="hidden" onChange={function(e) { handleImageUpload(e, card) }} />
                    </label>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-2.5">
                  <div>
                    <label className="text-[10px] text-stone-400 dark:text-stone-500 block mb-1">Nom (badge)</label>
                    <input
                      value={card.label}
                      onChange={function(e) { updateLocalField(card._id, 'label', e.target.value) }}
                      onBlur={function(e) { persistField(card._id, 'label', e.target.value) }}
                      className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-xs bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 dark:text-stone-500 block mb-1">Titre affiché</label>
                    <textarea
                      value={card.title}
                      onChange={function(e) { updateLocalField(card._id, 'title', e.target.value) }}
                      onBlur={function(e) { persistField(card._id, 'title', e.target.value) }}
                      rows={2}
                      className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-sm bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-400 dark:text-stone-500 block mb-1">Catégorie liée</label>
                    <select
                      value={card.category}
                      onChange={function(e) {
                        updateLocalField(card._id, 'category', e.target.value)
                        persistField(card._id, 'category', e.target.value)
                      }}
                      className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-xs bg-[#faf9f7] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
                    >
                      {CATEGORY_OPTIONS.map(function(opt) {
                        return <option key={opt.value} value={opt.value}>{opt.label}</option>
                      })}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
