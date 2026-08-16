const PLACEHOLDER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f5f3f0"/><path d="M55 135l28-34 22 24 32-42 28 34v18a6 6 0 01-6 6H61a6 6 0 01-6-6z" fill="#d6d3d1"/><circle cx="72" cy="72" r="13" fill="#d6d3d1"/></svg>'

// Data URI — pas de dependance sur un service externe (via.placeholder.com est mort)
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(PLACEHOLDER_SVG)

export function onImgError(e) {
  e.currentTarget.onerror = null
  e.currentTarget.src = PLACEHOLDER_IMAGE
}
