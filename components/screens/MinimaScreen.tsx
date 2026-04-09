'use client'

import { useState } from 'react'
import type { FlightSetup, ApchMinima, ApchType } from '@/lib/types'
import { getDepRuleText } from '@/lib/planning-rules'
import { Screen, SHead, BottomBar, Segment } from '@/components/ui'

interface Props {
  setup: FlightSetup
  depMinima: ApchMinima
  destMinima: ApchMinima
  onBack: () => void
  onLaunch: (dep: ApchMinima, dest: ApchMinima) => void
}

export default function MinimaScreen({ setup, depMinima, destMinima, onBack, onLaunch }: Props) {
  const [dep, setDep] = useState<ApchMinima>(depMinima)
  const [dest, setDest] = useState<ApchMinima>(destMinima)

  function handleLaunch() {
    onLaunch(dep, dest)
  }

  const apchOptions = [
    { value: '3D', label: '3D (ILS/LPV)' },
    { value: '2D', label: '2D (NPA)' },
    { value: 'circ', label: 'Circling' },
  ]

  return (
    <Screen>
      <SHead
        step="Cartes Jeppesen"
        title="Minima d'approche"
        sub="Relevez les valeurs sur vos cartes d'approche."
      />

      {/* Départ */}
      <div className="card">
        <div className="card-label">Départ — {setup.dep}</div>
        <div className="mb-4">
          <Segment
            options={apchOptions}
            value={dep.type}
            onChange={(v) => setDep({ ...dep, type: v as ApchType })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-slate-400 font-medium">DH / MDH (ft)</label>
            <input
              type="number"
              className="field-input"
              value={dep.dh}
              onChange={(e) => setDep({ ...dep, dh: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-slate-400 font-medium">RVR / Vis (m)</label>
            <input
              type="number"
              className="field-input"
              value={dep.rvr}
              onChange={(e) => setDep({ ...dep, rvr: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="hint-box">
          {getDepRuleText(setup.acType, dep.dh, dep.rvr)}
        </div>
      </div>

      {/* Destination */}
      <div className="card">
        <div className="card-label">Destination — {setup.dest}</div>
        <div className="mb-4">
          <Segment
            options={apchOptions}
            value={dest.type}
            onChange={(v) => setDest({ ...dest, type: v as ApchType })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-slate-400 font-medium">DH / MDH (ft)</label>
            <input
              type="number"
              className="field-input"
              value={dest.dh}
              onChange={(e) => setDest({ ...dest, dh: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-slate-400 font-medium">RVR / Vis (m)</label>
            <input
              type="number"
              className="field-input"
              value={dest.rvr}
              onChange={(e) => setDest({ ...dest, rvr: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {dest.type !== '3D' && (
          <div className="flex flex-col gap-1.5 mt-3">
            <label className="text-[13px] text-slate-400 font-medium">
              Plafond requis (ft) — {dest.type === 'circ' ? 'Circling' : 'NPA'}
            </label>
            <input
              type="number"
              className="field-input"
              value={dest.ceil || ''}
              placeholder="ex: 800"
              onChange={(e) =>
                setDest({ ...dest, ceil: parseInt(e.target.value) || undefined })
              }
            />
          </div>
        )}

        <div className="hint-box mt-2">
          0 alternate si plafond {'>'} DH+1000ft <strong>et</strong> Vis {'>'} 5000m à ETA±1h
        </div>
      </div>

      <BottomBar>
        <button
          className="btn-primary"
          style={{ background: '#059669' }}
          onClick={handleLaunch}
        >
          Lancer le briefing →
        </button>
        <button className="btn-ghost" onClick={onBack}>
          ‹ Retour
        </button>
      </BottomBar>
    </Screen>
  )
}
