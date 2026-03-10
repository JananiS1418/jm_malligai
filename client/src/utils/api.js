export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

function getBackendOrigin() {
  const explicit = import.meta.env.VITE_BACKEND_URL
  if (explicit && typeof explicit === 'string') return explicit.replace(/\/+$/, '')

  // If API_BASE is absolute (e.g. https://xxx.onrender.com/api), derive origin.
  if (API_BASE.startsWith('http://') || API_BASE.startsWith('https://')) {
    try {
      const u = new URL(API_BASE)
      return u.origin
    } catch {
      return ''
    }
  }
  return ''
}

export const BACKEND_ORIGIN = getBackendOrigin()

export function resolveUploadUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (url.startsWith('/uploads/')) {
    return BACKEND_ORIGIN ? `${BACKEND_ORIGIN}${url}` : url
  }
  return url
}

