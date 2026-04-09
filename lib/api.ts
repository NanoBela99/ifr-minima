/**
 * Proxy Cloudflare Worker URL — à remplacer après déploiement du worker.
 * Le worker est dans /worker/proxy.js
 *
 * Remplacer VOTRE_WORKER_URL par l'URL obtenue après "wrangler deploy"
 * Ex: https://ifr-proxy.votrenom.workers.dev
 */
const PROXY_BASE = process.env.NEXT_PUBLIC_PROXY_URL || 'https://ifr-proxy.votrenom.workers.dev'

const AW_BASE = 'https://aviationweather.gov/api/data'

async function proxyFetch(url: string): Promise<unknown[] | null> {
  try {
    const proxied = `${PROXY_BASE}?url=${encodeURIComponent(url)}`
    const res = await fetch(proxied, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data) ? (data.length ? data : null) : null
  } catch {
    return null
  }
}

export async function fetchMetar(icao: string): Promise<unknown[] | null> {
  return proxyFetch(`${AW_BASE}/metar?ids=${icao}&format=json&hours=3`)
}

export async function fetchTaf(icao: string): Promise<unknown[] | null> {
  return proxyFetch(`${AW_BASE}/taf?ids=${icao}&format=json`)
}

export async function fetchNotams(icao: string): Promise<unknown[] | null> {
  const data = await proxyFetch(
    `${AW_BASE}/notam?icaoLocation=${icao}&format=json`
  )
  if (!data) return null
  // La réponse peut être un tableau d'objets ou { notams: [...] }
  return data
}
