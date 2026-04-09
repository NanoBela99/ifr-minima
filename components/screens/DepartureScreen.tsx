'use client'

import type { FlightSetup, ApchMinima, PlanningResult } from '@/lib/types'
import { fmtCeil, fmtVis } from '@/lib/metar-parser'
import { getTakeoffAltText } from '@/lib/planning-rules'
import { Screen, SHead, BottomBar, AltMinimaGrid } from '@/components/ui'

interface Props {
  setup: FlightSetup
  depMinima: ApchMinima
  result: PlanningResult
  onNext: () => void
}

export default function DepartureScreen({ setup, depMinima, result, onNext }: Props) {
  const dw = result.depWx
  const mc = setup.acType === 'MEP' ? depMinima.dh : depMinima.dh + 200
  const mv = setup.acType === 'MEP' ? depMinima.rvr : depMinima.rvr + 1000
  const c = dw?.ceiling
  const v = dw?.rvr ?? dw?.vis
  const cOk = c !== null && c !== undefined && c >= mc
  const vOk = v !== null && v !== undefined && v >= mv

  return (
    <Screen>
      <SHead
        step="Étape 2 — Départ"
        title={`Départ — ${setup.dep}`}
        sub={`ETD ${setup.etd} UTC — Fenêtre ETD → ETD+1h`}
      />

      {/* Verdict départ */}
      <div className={`rc ${result.depOk ? 'rc-go' : 'rc-fail'}`}>
        <div className="rc-title">
          {result.depOk ? '✓ Départ autorisé' : '✗ Minima non atteints'}
        </div>
        <div className="rc-sub">{result.depReason}</div>
      </div>

      {/* Tableau comparatif */}
      <div className="card">
        <div className="card-label">Comparaison METAR vs Minima ({setup.acType})</div>
        <table className="w-full border-collapse mt-1">
          <thead>
            <tr>
              <th className="comp-th">Paramètre</th>
              <th className="comp-th text-center">Requis</th>
              <th className="comp-th text-center">METAR actuel</th>
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
              <td className="comp-td">RVR / Vis</td>
              <td className="comp-td text-center">≥ {mv} m</td>
              <td className={`comp-td text-center ${dw ? (vOk ? 'val-ok' : 'val-fail') : 'val-na'}`}>
                {fmtVis(v)}
              </td>
            </tr>
          </tbody>
        </table>

        {dw?.raw ? (
          <div className="metar-raw">{dw.raw}</div>
        ) : (
          <div className="hint-box mt-3">
            ⚠ METAR non disponible — vérifiez manuellement.
          </div>
        )}
      </div>

      {/* Alternate de départ */}
      {result.takeoffAlt && (
        <div className="rc rc-warn">
          <div className="rc-title">! Alternate de départ requis</div>
          <div className="rc-sub">
            <strong>Météo requise jusqu'à ETA+1h</strong>
            <br />
            {getTakeoffAltText(setup.acType)}
          </div>
        </div>
      )}

      <BottomBar>
        <button
          className="btn-primary"
          style={{ background: '#0B1D3A' }}
          onClick={onNext}
        >
          Vérifier la destination →
        </button>
      </BottomBar>
    </Screen>
  )
}
