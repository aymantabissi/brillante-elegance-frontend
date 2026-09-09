const SITE_URL = 'https://brillanteelegance.ma'

const STATIC_PATHS = ['/', '/shop', '/about', '/contact', '/faq']

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const FALLBACK_API_URL = 'https://brillante-elegance-backend-production.up.railway.app/api'

export default async function handler(req, res) {
  const apiBase = (process.env.VITE_API_URL || FALLBACK_API_URL).replace(/\/api\/?$/, '')

  let products = []
  try {
    const response = await fetch(apiBase + '/api/products')
    products = await response.json()
  } catch {
    products = []
  }

  const urls = [
    ...STATIC_PATHS.map((path) => ({ loc: SITE_URL + path, priority: path === '/' ? '1.0' : '0.8' })),
    ...(Array.isArray(products) ? products : []).map((p) => ({
      loc: SITE_URL + '/product/' + p._id,
      priority: '0.6',
      lastmod: p.updatedAt,
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `
    <lastmod>${new Date(u.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
  res.status(200).send(xml)
}
