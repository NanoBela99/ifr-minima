'use client'

import type { FlightSetup, ApchMinima, PlanningResult } from '@/lib/types'
import { getTakeoffAltText } from '@/lib/planning-rules'
import { Screen, SHead, BottomBar, SumRow, SiaLink, AltMinimaGrid } from '@/components/ui'

interface Props {
  setup: FlightSetup
  depMinima: ApchMinima
  destMinima: ApchMinima
  result: PlanningResult
  onReset: () => void
}

export default function SummaryScreen({ setup, depMinima, destMinima, result, onReset }: Props) {
  const excellent = result.destAlts === 0 && !result.takeoffAlt
  const dataIncomplete = !result.depWx || !result.destWx

  // GO* si données incomplètes, GO si tout est OK ou avec alternates planifiables
  const verdict = excellent ? 'GO' : dataIncomplete ? 'GO*' : 'GO'
  const verdictSub = excellent
    ? 'Conditions excellentes — aucun alternate requis.'
    : dataIncomplete
    ? '⚠ Données météo incomplètes — basé sur les prévisions disponibles. Vérifiez manuellement avant le départ.'
    : [
        result.takeoffAlt ? 'Alternate de départ requis.' : '',
        result.destAlts > 0
          ? `${result.destAlts} alternate${result.destAlts > 1 ? 's' : ''} de destination à planifier.`
          : '',
      ]
        .filter(Boolean)
        .join(' ')

  const bannerBg = excellent ? '#0B1D3A' : dataIncomplete ? '#92400E' : '#78350F'

  return (
    <Screen>
      <SHead step="Synthèse du briefing" title="Décision finale" />

      {/* Main verdict banner */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{ background: bannerBg }}
      >
        <p className="font-mono text-[13px] text-white/60 mb-3">
          {setup.dep} → {setup.dest} · ETD {setup.etd} / ETA {setup.eta} UTC · {setup.acType}
        </p>
        <p className="font-display text-[56px] font-extrabold text-white leading-none">
          {verdict}
        </p>
        <p className="text-[13px] text-white/65 mt-2 leading-relaxed">{verdictSub}</p>
      </div>

      {/* Checklist récap */}
      <div className="card">
        <div className="card-label">Récapitulatif planning</div>

        <SumRow
          type={result.depOk ? 'ok' : 'fail'}
          icon={result.depOk ? '✓' : '✗'}
          title={`Départ ${setup.dep} — ETD ${setup.etd} UTC`}
          detail={result.depReason}
        />

        {result.takeoffAlt && (
          <SumRow
            type="warn"
            icon="!"
            title="Alternate de départ requis"
            detail={getTakeoffAltText(setup.acType)}
          />
        )}

        <SumRow
          type={result.destAlts === 0 ? 'ok' : result.destAlts === 1 ? 'warn' : 'fail'}
          icon={result.destAlts === 0 ? '✓' : result.destAlts === 1 ? '!' : '✗'}
          title={`Destination ${setup.dest} — ETA ${setup.eta} UTC`}
          detail={result.destReason}
        />

        {result.destAlts > 0 && (
          <SumRow
            type="info"
            icon="i"
            title={`${result.destAlts} alternate${result.destAlts > 1 ? 's' : ''} de destination`}
            detail="Voir minima de planification ci-dessous."
          />
        )}
      </div>

      {/* Minima alternate si requis */}
      {result.destAlts > 0 && (
        <div className="card">
          <div className="card-label">Minima de planification alternate — ETA±1h</div>
          <AltMinimaGrid />
        </div>
      )}

      {/* Liens SIA */}
      <SiaLink
        href="https://sofia-briefing.aviation-civile.gouv.fr/sofia/pages/prepavol.html"
        label="SOFIA Briefing — NOTAMs + météo officielle"
      />

      <BottomBar>
        <button className="btn-ghost" onClick={onReset}>
          ↺ Nouvelle analyse
        </button>
      </BottomBar>
    </Screen>
  )
}
