'use client'

import { useState } from 'react'
import type { Notam } from '@/lib/types'
import { Screen, SHead, BottomBar, SiaLink } from '@/components/ui'

interface Props {
  dep: string
  dest: string
  depNotams: Notam[]
  destNotams: Notam[]
  onToggle: (which: 'dep' | 'dest', index: number) => void
  onNext: () => void
}

export default function NotamScreen({
  dep, dest, depNotams, destNotams, onToggle, onNext,
}: Props) {
  const [tab, setTab] = useState<'dep' | 'dest'>('dep')
  const list = tab === 'dep' ? depNotams : destNotams
  const sorted = [...list.filter((n) => n.crit), ...list.filter((n) => !n.crit)]

  return (
    <Screen>
      <SHead
        step="Étape 1 — Check NOTAM & Weather"
        title="NOTAMs"
        sub="Lisez chaque NOTAM. Cochez les critiques pour confirmer la lecture."
      />

      <SiaLink href="https://sofia-briefing.aviation-civile.gouv.fr/sofia/pages/prepavol.html" label="SOFIA Briefing — NOTAMs + météo officielle" />
      <SiaLink href="https://www.sia.aviation-civile.gouv.fr/" label="SIA — SUP AIP · AIC · Cartes" />

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-black/[0.08] mb-4 mt-1">
        {(['dep', 'dest'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 h-12 text-[15px] font-semibold border-r last:border-r-0 border-black/[0.08]
                        transition-colors ${tab === t ? 'bg-navy text-white' : 'bg-white text-slate-400'}`}
          >
            {t === 'dep' ? dep : dest}{' '}
            <span className="text-[12px] opacity-70">
              ({t === 'dep' ? depNotams.length : destNotams.length})
            </span>
          </button>
        ))}
      </div>

      {/* Notam list */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-black/[0.08]">
          <div className="text-3xl mb-2">📋</div>
          <p className="font-semibold text-navy mb-1">Aucun NOTAM récupéré</p>
          <p className="text-[13px] text-slate-400">Consultez le SIA via les liens ci-dessus.</p>
        </div>
      ) : (
        sorted.map((n, i) => {
          const origIdx = list.indexOf(n)
          return (
            <div
              key={i}
              className={`notam-card ${n.crit ? 'crit' : ''} ${n.read ? 'read' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`font-display text-[12px] font-bold tracking-wider ${
                    n.crit ? 'text-red-500' : 'text-slate-400'
                  }`}
                >
                  {n.crit ? '⚠ OPÉRATIONNEL' : 'NOTAM'}
                  {n.ref ? ` — ${n.ref}` : ''}
                </span>
                <button
                  onClick={() => onToggle(tab, origIdx)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                               text-[11px] font-bold transition-all
                               ${n.read
                                 ? 'bg-emerald-500 border-emerald-500 text-white'
                                 : 'bg-transparent border-slate-200'}`}
                >
                  {n.read ? '✓' : ''}
                </button>
              </div>
              <pre className="font-mono text-[11.5px] leading-7 whitespace-pre-wrap break-words text-navy">
                {n.msg}
              </pre>
            </div>
          )
        })
      )}

      <BottomBar>
        <button
          className="btn-primary"
          style={{ background: '#0B1D3A' }}
          onClick={onNext}
        >
          NOTAMs vérifiés — Continuer →
        </button>
      </BottomBar>
    </Screen>
  )
}
