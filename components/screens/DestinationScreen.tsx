'use client'

import type { FlightSetup, ApchMinima, PlanningResult } from '@/lib/types'
import { fmtCeil, fmtVis } from '@/lib/metar-parser'
import { Screen, SHead, BottomBar, AltMinimaGrid } from '@/components/ui'

interface Props {
  setup: FlightSetup
  destMinima: ApchMinima
  result: PlanningResult
  onNext: () => void
}

const VERDICTS = [
  '✓ Aucun alternate de destination requis',
  '! 1 alternate de destination requis',
  '✗ 2 alternates de destination requis',
]
const RC_CLASSES = ['rc-go', 'rc-warn', 'rc-fail'] as const

export default function DestinationScreen({ setup, destMinima, result, onNext }: Props) {
  const dw = result.destWx
  const mc = destMinima.type !== '3D' && destMinima.ceil ? destMinima.ceil : destMinima.dh
  const mv = destMinima.rvr
  const c = dw?.ceiling
  const v = dw?.vis
  const cOk = c !== null && c !== undefined && c >= mc
  const vOk = v !== null && v !== undefined && v >= mv
  const exC = destMinima.dh + 1000

  return (
    <Screen>
      <SHead
        step="Étape 3 — Destination"
        title={`Destination — ${setup.dest}`}
        sub={`ETA ${setup.eta} UTC — Prévision ETA−1h → ETA+1h`}
      />

      {/* Verdict destination */}
      <div className={`rc ${result.destExcellent ? 'rc-go' : RC_CLASSES[result.destAlts]}`}>
        <div className="rc-title">{VERDICTS[result.destAlts]}</div>
        <div className="rc-sub">{result.destReason}</div>
      </div>

      {/* Tableau comparatif */}
      <div className="card">
        <div className="card-label">
          {result.destSource === 'TAF'
            ? `TAF — prévision ETA±1h`
            : 'METAR — données actuelles'}
        </div>
        <table className="w-full border-collapse mt-1">
          <thead>
            <tr>
              <th className="comp-th">Paramètre</th>
              <th className="comp-th text-center">Minima atterrissage</th>
              <th className="comp-th text-center">Prévu ETA±1h</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="comp-td">Plafond</td>
              <td className="comp-td text-center">≥ {mc} ft</td>
              <td className={`comp-td text-center ${dw ? (cOk ? 'val-ok' : 'val-fail') : 'val-na'}`}>
                {fmtCeil(c)}
              </td>
            </tr>
            <tr>
              <td className="comp-td">Visibilité</td>
              <td className="comp-td text-center">≥ {mv} m</td>
              <td className={`comp-td text-center ${dw ? (vOk ? 'val-ok' : 'val-fail') : 'val-na'}`}>
                {fmtVis(v)}
              </td>
            </tr>
            <tr className="opacity-60 text-[12px]">
              <td className="comp-td text-[12px]">Seuil 0 alternate</td>
              <td className="comp-td text-center text-[12px]">
                {'>'} {exC}ft / {'>'} 5000m
              </td>
              <td className={`comp-td text-center ${result.destExcellent ? 'val-ok' : 'val-na'}`}>
                {result.destExcellent ? '✓' : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Minima de planification alternate */}
      {result.destAlts > 0 && (
        <div className="card">
          <div className="card-label">
            Minima de planification alternate — ETA±1h
          </div>
          <AltMinimaGrid />
        </div>
      )}

      <BottomBar>
        <button
          className="btn-primary"
          style={{ background: '#059669' }}
          onClick={onNext}
        >
          Voir la synthèse →
        </button>
      </BottomBar>
    </Screen>
  )
}
