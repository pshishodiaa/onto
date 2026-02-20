import { useState } from 'react'
import { getApiConfig, setApiConfig } from '../utils/storage.js'

export default function Settings({ onClose }) {
  const config = getApiConfig()
  const [url, setUrl] = useState(config.url)
  const [token, setToken] = useState(config.token)
  const [saved, setSaved] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    setApiConfig(url.trim(), token.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Sync Settings</h2>
        <p className="settings-desc">
          Connect to your Cloudflare Worker to sync data between devices. Leave blank to use
          local-only mode.
        </p>
        <form onSubmit={handleSave}>
          <label>
            API URL
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://onto-api.your-name.workers.dev"
            />
          </label>
          <label>
            API Token
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="your-secret-token"
            />
          </label>
          <div className="settings-actions">
            <button type="submit" className="settings-save">
              {saved ? 'Saved!' : 'Save'}
            </button>
            <button type="button" className="settings-close" onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
