import { STORAGE_KEYS } from './constants.js'

export function loadDay(dateKey) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAY_PREFIX + dateKey)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveDay(dateKey, data) {
  localStorage.setItem(STORAGE_KEYS.DAY_PREFIX + dateKey, JSON.stringify(data))
}

export function loadPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESETS)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function savePresets(presets) {
  localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets))
}

export function getApiConfig() {
  return {
    url: localStorage.getItem(STORAGE_KEYS.API_URL) || '',
    token: localStorage.getItem(STORAGE_KEYS.API_TOKEN) || '',
  }
}

export function setApiConfig(url, token) {
  localStorage.setItem(STORAGE_KEYS.API_URL, url)
  localStorage.setItem(STORAGE_KEYS.API_TOKEN, token)
}
