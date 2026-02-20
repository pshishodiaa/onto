const API_URL = import.meta.env.VITE_API_URL || ''
const API_TOKEN = import.meta.env.VITE_API_TOKEN || ''

async function apiFetch(path, options = {}) {
  if (!API_URL || !API_TOKEN) return null

  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL

  try {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
        ...options.headers,
      },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export function hasApiConfig() {
  return !!(API_URL && API_TOKEN)
}

export async function fetchDay(dateKey) {
  return apiFetch(`/api/day/${dateKey}`)
}

export async function pushDay(dateKey, data) {
  return apiFetch(`/api/day/${dateKey}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function fetchPresets() {
  return apiFetch('/api/presets')
}

export async function pushPresets(presets) {
  return apiFetch('/api/presets', {
    method: 'PUT',
    body: JSON.stringify(presets),
  })
}
