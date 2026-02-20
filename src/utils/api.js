import { getApiConfig } from './storage.js'

async function apiFetch(path, options = {}) {
  const { url, token } = getApiConfig()
  if (!url || !token) return null

  const base = url.endsWith('/') ? url.slice(0, -1) : url

  try {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
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
