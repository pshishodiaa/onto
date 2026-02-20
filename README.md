# Onto — Time Tracker

A stopwatch-style time tracker for logging what you do throughout the day. See where your time actually goes.

## How it works

1. Type what you're about to do (e.g., "breakfast") and hit Start
2. When you switch activities, type the next one — the previous lap ends automatically
3. Tap preset buttons for common activities
4. Check the Summary tab to see your time breakdown

## Local development

```bash
npm install
npm run dev
```

## Deploy

### Frontend (Cloudflare Pages)

1. Push to GitHub
2. In Cloudflare Dashboard → Pages → Create project → Connect to Git
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`

### Sync API (Cloudflare Workers)

1. Install Wrangler: `npm install -g wrangler`
2. Login: `wrangler login`
3. Create KV namespace: `wrangler kv namespace create ONTO_KV`
4. Update `wrangler.toml` with the KV namespace ID from step 3
5. Set the API token secret: `wrangler secret put API_TOKEN` (type a secret token)
6. Deploy: `wrangler deploy`

Then in the app, tap the gear icon and enter:
- **API URL**: `https://onto-api.<your-subdomain>.workers.dev`
- **API Token**: the same token from step 5
