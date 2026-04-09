'use client'

import { useState } from 'react'
import type { FlightSetup, AcType } from '@/lib/types'
import { Screen, SHead, BottomBar, Segment } from '@/components/ui'

interface Props {
  setup: FlightSetup
  onChange: (s: FlightSetup) => void
  onNext: () => void
}

export default function SetupScreen({ setup, onChange, onNext }: Props) {
  const [err, setErr] = useState('')

  function upd(key: keyof FlightSetup, value: string) {
    onChange({ ...setup, [key]: value })
  }

  function handleNext() {
    if (setup.dep.length < 3 || setup.dest.length < 3) {
      setErr('Codes OACI invalides (min 3 lettres)')
      return
    }
    setErr('')
    onNext()
  }

  return (
    <Screen>
      <SHead step="Nouveau briefing" title="Informations de vol" />

      <div className="card">
        <div className="card-label">Route</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-slate-400 font-medium">Départ (OACI)</label>
            <input
              className="icao-input"
              maxLength={4}
              value={setup.dep}
              onChange={(e) => upd('dep', e.target.value.toUpperCase())}
              placeholder="LFPG"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-slate-400 font-medium">Destination (OACI)</label>
            <input
              className="icao-input"
              maxLength={4}
              value={setup.dest}
              onChange={(e) => upd('dest', e.target.value.toUpperCase())}
              placeholder="LFMN"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-label">Type d'aéronef</div>
        <Segment
          options={[
            { value: 'MEP', label: 'MEP — Multi-moteur' },
            { value: 'SEP', label: 'SEP — Mono-moteur' },
          ]}
          value={setup.acType}
          onChange={(v) => upd('acType', v as AcType)}
        />
      </div>

      <div className="card">
        <div className="card-label">Horaires UTC</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-slate-400 font-medium">ETD</label>
            <input
              type="time"
              className="field-input"
              value={setup.etd}
              onChange={(e) => upd('etd', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-slate-400 font-medium">ETA</label>
            <input
              type="time"
              className="field-input"
              value={setup.eta}
              onChange={(e) => upd('eta', e.target.value)}
            />
          </div>
        </div>
      </div>

      {err && (
        <div className="text-red-500 text-[13px] text-center mb-2">{err}</div>
      )}

      <BottomBar>
        <button
          className="btn-primary"
          style={{ background: '#1B6FEB' }}
          onClick={handleNext}
        >
          Saisir les minima Jeppesen →
        </button>
      </BottomBar>
    </Screen>
  )
}
