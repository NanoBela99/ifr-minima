/**
 * IFR Minima — Cloudflare Worker CORS Proxy
 *
 * Déploiement (1 commande) :
 *   npx wrangler deploy worker/proxy.js --name ifr-proxy --compatibility-date 2024-01-01
 *
 * Puis mettre l'URL dans .env.local :
 *   NEXT_PUBLIC_PROXY_URL=https://ifr-proxy.votrenom.workers.dev
 *
 * Coût : Gratuit jusqu'à 100 000 req/jour (largement suffisant)
 */

export default {
  async fetch(request) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': '*',
        },
      })
    }

    const { searchParams } = new URL(request.url)
    const target = searchParams.get('url')

    if (!target) {
      return new Response('Missing ?url= parameter', { status: 400 })
    }

    // Whitelist : uniquement aviationweather.gov
    if (!target.startsWith('https://aviationweather.gov/')) {
      return new Response('Unauthorized domain', { status: 403 })
    }

    try {
      const upstream = await fetch(target, {
        headers: { 'User-Agent': 'IFR-Minima-App/1.0' },
      })

      const body = await upstream.text()

      return new Response(body, {
        status: upstream.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300', // Cache 5 min
        },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }
  },
}
