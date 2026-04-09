import type { WxObservation } from './types'

/**
 * Extrait les données météo depuis le JSON structuré d'aviationweather.gov
 * Format: https://aviationweather.gov/api/data/metar?ids=XXXX&format=json
 */
export function extractMetar(arr: unknown[] | null): WxObservation | null {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return null
  const m = arr[0] as Record<string, unknown>

  const result: WxObservation = {
    raw: (m.rawOb as string) || '',
    ceiling: null,
    vis: null,
    rvr: null,
    name: (m.name as string) || '',
  }

  // Visibilité depuis le champ JSON (plus fiable que parsing raw)
  if (m.visib != null) {
    const v = String(m.visib)
    if (/^9999$|P6SM|\+/.test(v)) {
      result.vis = 9999
    } else if (v.includes('SM')) {
      result.vis = Math.round(parseFloat(v) * 1609)
    } else {
      result.vis = parseInt(v) || null
    }
  }

  // Plafond depuis le champ clouds JSON
  const clouds = (m.clouds as Array<{ cover: string; base: number }>) || []
  if (clouds.length) {
    let ceil: number | null = null
    for (const cl of clouds) {
      const cov = (cl.cover || '').toUpperCase()
      if (cov === 'BKN' || cov === 'OVC') {
        const base = parseInt(String(cl.base || 0)) * 100
        if (ceil === null || base < ceil) ceil = base
      }
    }
    result.ceiling = ceil !== null ? ceil : 9999 // No BKN/OVC = clear
  }

  // CAVOK → tout dégagé
  if (/\bCAVOK\b/.test(result.raw)) {
    result.ceiling = 9999
    result.vis = 9999
  }

  // RVR depuis le raw (pas disponible en JSON)
  const rvrMatch = result.raw.match(/\bR\d+[LCR]?\/P?(\d{4})[UDN]?\b/)
  if (rvrMatch) result.rvr = parseInt(rvrMatch[1])

  return result
}

/**
 * Extrait les conditions météo d'un TAF à une heure UTC donnée.
 * Prend le pire scénario (TEMPO inclus) dans la fenêtre ETA±1h.
 */
export function extractTafAtHour(
  arr: unknown[] | null,
  utcTime: string
): WxObservation | null {
  if (!arr || !Array.isArray(arr) || !arr.length) return null

  const targetH = parseInt(utcTime.split(':')[0])
  const taf = arr[0] as Record<string, unknown>
  const fcsts = (taf.fcsts as Record<string, unknown>[]) || []

  let worst: { ceiling: number | null; vis: number | null } | null = null

  for (const f of fcsts) {
    try {
      const from = new Date((f.timeFrom || f.fcstTimeFrom) as string)
      const to = new Date((f.timeTo || f.fcstTimeTo) as string)
      if (isNaN(from.getTime()) || isNaN(to.getTime())) continue

      const fh = from.getUTCHours()
      const tt = to.getUTCHours()
      const fd = from.getUTCDate()
      const td = to.getUTCDate()

      // Fenêtre ETA-1h à ETA+1h
      const targetMin = (targetH - 1 + 24) % 24
      const targetMax = (targetH + 1) % 24
      const inRange =
        fd === td
          ? targetH >= fh && targetH < tt
          : targetH >= fh || targetH < tt

      if (!inRange) continue

      const cur: { ceiling: number | null; vis: number | null } = {
        vis: null,
        ceiling: null,
      }

      // Visibilité
      if (f.visib != null) {
        const v = String(f.visib)
        if (/^9999$|P6SM/.test(v)) cur.vis = 9999
        else if (v.includes('SM')) cur.vis = Math.round(parseFloat(v) * 1609)
        else cur.vis = parseInt(v) || null
      }

      // Plafond
      const cl = (f.clouds as Array<{ cover: string; base: number }>) || []
      let ceil: number | null = null
      for (const x of cl) {
        const cv = (x.cover || '').toUpperCase()
        if (cv === 'BKN' || cv === 'OVC') {
          const b = parseInt(String(x.base || 0)) * 100
          if (ceil === null || b < ceil) ceil = b
        }
      }
      cur.ceiling = cl.length && ceil !== null ? ceil : 9999

      // Pire scénario
      if (!worst) {
        worst = cur
      } else {
        if ((cur.ceiling ?? 9999) < (worst.ceiling ?? 9999))
          worst.ceiling = cur.ceiling
        if ((cur.vis ?? 9999) < (worst.vis ?? 9999)) worst.vis = cur.vis
      }
    } catch {
      continue
    }
  }

  if (!worst) return null
  return { raw: '', ceiling: worst.ceiling, vis: worst.vis, rvr: null }
}

// ── Formatters ─────────────────────────────────────────────────────────────
export function fmtCeil(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—'
  if (v >= 9999) return '> 10 000 ft'
  return `${v} ft`
}

export function fmtVis(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—'
  if (v >= 9999) return '> 10 km'
  return `${v} m`
}
