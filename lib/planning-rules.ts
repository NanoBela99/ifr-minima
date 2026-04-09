import type {
  AcType,
  ApchMinima,
  PlanningResult,
  WxObservation,
} from './types'

/**
 * Applique les règles de planification IFR de l'école.
 * Suit exactement le logigramme fourni.
 */
export function computePlanning(params: {
  acType: AcType
  depMinima: ApchMinima
  destMinima: ApchMinima
  depWx: WxObservation | null
  destWx: WxObservation | null
  destSource: 'TAF' | 'METAR' | null
}): PlanningResult {
  const { acType, depMinima, destMinima, depWx, destWx, destSource } = params

  // ── DÉPART ──────────────────────────────────────────────────────────────
  // MEP : RVR/VIS + ceiling > landing minima jusqu'à ETD+1h
  // SEP : landing DH+200ft, RVR/visi+1000m jusqu'à ETD+1h
  let depOk = false
  let depReason = ''
  let takeoffAlt = false

  if (!depWx || depWx.ceiling === null) {
    depOk = false
    takeoffAlt = true
    depReason =
      'METAR non disponible — vérification manuelle requise. Alternate de départ considéré requis.'
  } else {
    const ceiling = depWx.ceiling ?? 9999
    const vis = depWx.rvr ?? depWx.vis ?? 0

    // Minima requis selon type aéronef
    const minCeil =
      acType === 'MEP' ? depMinima.dh : depMinima.dh + 200
    const minVis =
      acType === 'MEP' ? depMinima.rvr : depMinima.rvr + 1000

    depOk = ceiling >= minCeil && vis >= minVis
    takeoffAlt = !depOk

    if (depOk) {
      depReason = `Plafond ${ceiling}ft ≥ ${minCeil}ft — Vis ${vis}m ≥ ${minVis}m`
    } else {
      const parts: string[] = []
      if (ceiling < minCeil)
        parts.push(`Plafond ${ceiling}ft insuffisant (requis ≥${minCeil}ft)`)
      if (vis < minVis)
        parts.push(`Vis ${vis}m insuffisante (requis ≥${minVis}m)`)
      depReason = parts.join(' — ')
    }
  }

  // ── DESTINATION ─────────────────────────────────────────────────────────
  // Étape 1 : la météo dest est-elle praticable ?
  //   3D APCH : prendre RVR/VISI
  //   2D APCH : prendre RVR/VISI + Ceiling
  //   Circling : prendre Circling Minima
  //
  // Étape 2 : si OUI → plafond > DH/MDH+1000ft ET Vis > 5km à ETA±1h ?
  //   Oui → 0 alternate
  //   Non → 1 alternate destination
  //
  // Si NON ou pas de prévision → 2 alternates destination

  let destAlts: 0 | 1 | 2 = 0
  let destOk = false
  let destExcellent = false
  let destReason = ''

  if (!destWx || destWx.ceiling === null) {
    destAlts = 2
    destOk = false
    destExcellent = false
    destReason =
      'Pas de prévision disponible à ETA±1h — 2 alternates de destination requis'
  } else {
    const ceiling = destWx.ceiling ?? 9999
    const vis = destWx.vis ?? 0

    // Minima d'atterrissage destination
    const minCeil =
      destMinima.type !== '3D' && destMinima.ceil
        ? destMinima.ceil
        : destMinima.dh
    const minVis = destMinima.rvr

    // La météo est-elle praticable ?
    destOk = ceiling >= minCeil && vis >= minVis

    if (!destOk) {
      // Météo insuffisante → 2 alternates
      destAlts = 2
      destExcellent = false
      destReason = `Météo insuffisante — plafond ${ceiling}ft (requis ≥${minCeil}ft) — Vis ${vis}m (requis ≥${minVis}m) → 2 alternates`
    } else {
      // Météo praticable → test du critère 0 alternate
      // Plafond > DH/MDH+1000ft ET Vis > 5km
      const excCeil = destMinima.dh + 1000
      const excVis = 5000

      destExcellent = ceiling > excCeil && vis > excVis

      if (destExcellent) {
        destAlts = 0
        destReason = `Excellent — plafond ${ceiling}ft > DH+1000ft (${excCeil}ft) et Vis ${vis}m > 5000m → aucun alternate`
      } else {
        destAlts = 1
        destReason = `Praticable mais critère 0-alternate non atteint — plafond ${ceiling}ft / Vis ${vis}m → 1 alternate`
      }
    }
  }

  return {
    depOk,
    depReason,
    depWx,
    takeoffAlt,
    destAlts,
    destOk,
    destExcellent,
    destReason,
    destWx,
    destSource,
  }
}

// ── NOTAM criticality detector ──────────────────────────────────────────────
export function isNotamCritical(msg: string): boolean {
  return /\b(RWY|ILS|GP|LOC|GLS|CLSD|CLOSED|INOP|U\/S|UNSERVICEABLE|APP|LDG|DEP|GPS|GNSS|TWR|GND|PAPI|VASI|NDB|VOR|DME)\b/i.test(
    msg
  )
}

// ── Textes des règles ────────────────────────────────────────────────────────
export function getDepRuleText(acType: AcType, dh: number, rvr: number): string {
  if (acType === 'MEP') {
    return `MEP : plafond et RVR/Vis supérieurs aux minima d'atterrissage (≥${dh}ft / ≥${rvr}m)`
  }
  return `SEP : DH+200ft = ${dh + 200}ft et RVR+1000m = ${rvr + 1000}m`
}

export function getTakeoffAltText(acType: AcType): string {
  if (acType === 'MEP') {
    return 'MEP : distance max 60 min OEI — Minima : landing minima standards'
  }
  return 'SEP : distance max 30 min — Minima : DH+200ft / RVR+1000m'
}
