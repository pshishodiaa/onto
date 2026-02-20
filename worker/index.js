export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Auth check
    const authHeader = request.headers.get('Authorization')
    const expectedToken = env.API_TOKEN
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(request.url)
    const path = url.pathname

    // GET /api/day/:date
    const dayMatch = path.match(/^\/api\/day\/(\d{4}-\d{2}-\d{2})$/)
    if (dayMatch) {
      const dateKey = dayMatch[1]

      if (request.method === 'GET') {
        const data = await env.ONTO_KV.get(`day:${dateKey}`, 'json')
        return new Response(JSON.stringify(data || { laps: [], activeLap: null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (request.method === 'PUT') {
        const body = await request.json()
        await env.ONTO_KV.put(`day:${dateKey}`, JSON.stringify(body))
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // GET/PUT /api/presets
    if (path === '/api/presets') {
      if (request.method === 'GET') {
        const data = await env.ONTO_KV.get('presets', 'json')
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (request.method === 'PUT') {
        const body = await request.json()
        await env.ONTO_KV.put('presets', JSON.stringify(body))
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  },
}
