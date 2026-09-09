import { useEffect } from 'react'

const SITE_NAME = 'Brillante Élégance'
const SITE_URL = 'https://brillanteelegance.ma'

const setMeta = (attr, key, content) => {
  if (!content) return
  let tag = document.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

// Definit le <title>, la meta description et les balises
// Open Graph de la page courante — chaque page a besoin d'un
// titre/description uniques pour bien se referencer sur Google.
export function useSEO({ title, description, image, path }) {
  useEffect(function() {
    const fullTitle = title ? title + ' | ' + SITE_NAME : SITE_NAME

    document.title = fullTitle
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', SITE_NAME)
    if (image) setMeta('property', 'og:image', image)
    if (path) setMeta('property', 'og:url', SITE_URL + path)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', SITE_URL + (path || ''))
  }, [title, description, image, path])
}

// Injecte un <script type="application/ld+json"> dans <head> —
// aide Google a comprendre qu'une page est un produit (prix,
// stock, marque) pour l'affichage en resultats enrichis.
export function useProductSchema(product) {
  useEffect(function() {
    if (!product) return

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || product.name,
      image: product.image,
      sku: product._id,
      brand: { '@type': 'Brand', name: 'Brillante Élégance' },
      offers: {
        '@type': 'Offer',
        url: SITE_URL + '/product/' + product._id,
        priceCurrency: 'MAD',
        price: product.price,
        availability: product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
    })
    document.head.appendChild(script)

    return function() { document.head.removeChild(script) }
  }, [product])
}
