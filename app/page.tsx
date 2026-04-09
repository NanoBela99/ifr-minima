'use client'

import { useState, useCallback } from 'react'
import type {
  AppState,
  FlightSetup,
  ApchMinima,
  Screen,
  Notam,
} from '@/lib/types'
import { extractMetar, extractTafAtHour } from '@/lib/metar-parser'
import { computePlanning, isNotamCritical } from '@/lib/planning-rules'
import { fetchMetar, fetchTaf, fetchNotams } from '@/lib/api'
import { TopBar } from '@/components/ui'

import SetupScreen from '@/components/screens/SetupScreen'
import MinimaScreen from '@/components/screens/MinimaScreen'
import LoadingScreen from '@/components/screens/LoadingScreen'
import NotamScreen from '@/components/screens/NotamScreen'
import DepartureScreen from '@/components/screens/DepartureScreen'
import DestinationScreen from '@/components/screens/DestinationScreen'
import SummaryScreen from '@/components/screens/SummaryScreen'

const SCREEN_NAMES: Record<Screen, string> = {
  setup: 'Configuration',
  minima: 'Minima Jeppesen',
  loading: 'Analyse…',
  notam: 'NOTAMs',
  departure: 'Départ',
  destination: 'Destination',
  summary: 'Synthèse',
}

const SCREEN_DOTS: Record<Screen, number> = {
  setup: -1,
  minima: -1,
  loading: -1,
  notam: 0,
  departure: 1,
  destination: 2,
  summary: 3,
}

const defaultSetup: FlightSetup = {
  dep: 'LFPG',
  dest: 'LFMN',
  acType: 'MEP',
  etd: '10:00',
  eta: '12:00',
}

const defaultDepMinima: ApchMinima = { type: '3D', dh: 200, rvr: 550 }
const defaultDestMinima: ApchMinima = { type: '3D', dh: 200, rvr: 550 }

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [setup, setSetup] = useState<FlightSetup>(defaultSetup)
  const [depMinima, setDepMinima] = useState<ApchMinima>(defaultDepMinima)
  const [destMinima, setDestMinima] = useState<ApchMinima>(defaultDestMinima)
  const [depNotams, setDepNotams] = useState<Notam[]>([])
  const [destNotams, setDestNotams] = useState<Notam[]>([])
  const [result, setResult] = useState<AppState['result']>(null)
  const [loading, setLoading] = useState<AppState['loading']>([])

  const goTo = useCallback((s: Screen) => {
    setScreen(s)
    window.scrollTo(0, 0)
  }, [])

  // ── Parse NOTAMs ──────────────────────────────────────────────────────────
  function parseNotams(data: unknown[] | null): Notam[] {
    if (!data) return []
    return data
      .slice(0, 30)
      .map((n) => {
        const obj = n as Record<string, string>
        const msg = (
          obj.traditionalMessage ||
          obj.message ||
          obj.text ||
          obj.notamText ||
          ''
        ).trim()
        return {
          ref: obj.traditionalMessageCode || obj.notamNumber || '',
          msg: msg.slice(0, 1000),
          crit: isNotamCritical(msg),
          read: false,
        }
      })
      .filter((n) => n.msg.length > 5)
  }

  // ── Fetch & analyse ───────────────────────────────────────────────────────
  async function startAnalysis(dep: ApchMinima, dest: ApchMinima) {
    setDepMinima(dep)
    setDestMinima(dest)

    const items = [
      `METAR ${setup.dep}`,
      `TAF ${setup.dep}`,
      `NOTAMs ${setup.dep}`,
      `METAR ${setup.dest}`,
      `TAF ${setup.dest}`,
      `NOTAMs ${setup.dest}`,
    ].map((label, i) => ({ id: String(i), label, status: 'wait' as const }))

    setLoading(items)
    goTo('loading')

    const upd = (id: number, status: 'run' | 'ok' | 'err', detail?: string) => {
      setLoading((prev) =>
        prev.map((it) => (it.id === String(id) ? { ...it, status, detail } : it))
      )
    }

    // METAR départ
    upd(0, 'run')
    const mDep = await fetchMetar(setup.dep)
    const depWxRaw = extractMetar(mDep)
    upd(0, depWxRaw ? 'ok' : 'err', depWxRaw ? depWxRaw.raw.slice(0, 40) + '…' : 'Non disponible')

    // TAF départ
    upd(1, 'run')
    const tDep = await fetchTaf(setup.dep)
    upd(1, tDep ? 'ok' : 'err')

    // NOTAMs départ
    upd(2, 'run')
    const nDep = await fetchNotams(setup.dep)
    const pDep = parseNotams(nDep)
    setDepNotams(pDep)
    upd(2, pDep.length ? 'ok' : 'err', pDep.length ? `${pDep.length} NOTAM(s)` : 'Voir SIA')

    // METAR destination
    upd(3, 'run')
    const mDest = await fetchMetar(setup.dest)
    const destWxRaw = extractMetar(mDest)
    upd(3, destWxRaw ? 'ok' : 'err', destWxRaw ? destWxRaw.raw.slice(0, 40) + '…' : 'Non disponible')

    // TAF destination
    upd(4, 'run')
    const tDest = await fetchTaf(setup.dest)
    upd(4, tDest ? 'ok' : 'err')

    // NOTAMs destination
    upd(5, 'run')
    const nDest = await fetchNotams(setup.dest)
    const pDest = parseNotams(nDest)
    setDestNotams(pDest)
    upd(5, pDest.length ? 'ok' : 'err', pDest.length ? `${pDest.length} NOTAM(s)` : 'Voir SIA')

    // Wx destination : TAF à ETA±1h en priorité, sinon METAR
    const destWxEta = extractTafAtHour(tDest, setup.eta) || destWxRaw
    const destSource = tDest ? 'TAF' : destWxRaw ? 'METAR' : null

    // Calcul planning
    const res = computePlanning({
      acType: setup.acType,
      depMinima: dep,
      destMinima: dest,
      depWx: depWxRaw,
      destWx: destWxEta,
      destSource,
    })
    setResult(res)

    await new Promise((r) => setTimeout(r, 600))
    goTo('notam')
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function reset() {
    setResult(null)
    setDepNotams([])
    setDestNotams([])
    setLoading([])
    goTo('setup')
  }

  // ── Toggle notam read ─────────────────────────────────────────────────────
  function toggleNotam(which: 'dep' | 'dest', index: number) {
    if (which === 'dep') {
      setDepNotams((prev) =>
        prev.map((n, i) => (i === index ? { ...n, read: !n.read } : n))
      )
    } else {
      setDestNotams((prev) =>
        prev.map((n, i) => (i === index ? { ...n, read: !n.read } : n))
      )
    }
  }

  return (
    <>
      <TopBar
        dep={setup.dep}
        dest={setup.dest}
        acType={setup.acType}
        stepName={SCREEN_NAMES[screen]}
        dotActive={SCREEN_DOTS[screen]}
      />

      {screen === 'setup' && (
        <SetupScreen
          setup={setup}
          onChange={setSetup}
          onNext={() => goTo('minima')}
        />
      )}

      {screen === 'minima' && (
        <MinimaScreen
          setup={setup}
          depMinima={depMinima}
          destMinima={destMinima}
          onBack={() => goTo('setup')}
          onLaunch={startAnalysis}
        />
      )}

      {screen === 'loading' && <LoadingScreen items={loading} />}

      {screen === 'notam' && (
        <NotamScreen
          dep={setup.dep}
          dest={setup.dest}
          depNotams={depNotams}
          destNotams={destNotams}
          onToggle={toggleNotam}
          onNext={() => goTo('departure')}
        />
      )}

      {screen === 'departure' && result && (
        <DepartureScreen
          setup={setup}
          depMinima={depMinima}
          result={result}
          onNext={() => goTo('destination')}
        />
      )}

      {screen === 'destination' && result && (
        <DestinationScreen
          setup={setup}
          destMinima={destMinima}
          result={result}
          onNext={() => goTo('summary')}
        />
      )}

      {screen === 'summary' && result && (
        <SummaryScreen
          setup={setup}
          depMinima={depMinima}
          destMinima={destMinima}
          result={result}
          onReset={reset}
        />
      )}
    </>
  )
}
