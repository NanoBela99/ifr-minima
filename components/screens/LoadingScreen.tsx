'use client'
// LoadingScreen
import type { LoadingItem } from '@/lib/types'
import { Screen, SHead, LoadItem } from '@/components/ui'

export default function LoadingScreen({ items }: { items: LoadingItem[] }) {
  return (
    <Screen>
      <SHead
        step="Récupération des données"
        title={<>Analyse<br />en cours…</>}
        sub="METAR · TAF · NOTAMs"
      />
      <div className="card">
        {items.map((it) => (
          <LoadItem key={it.id} label={it.label} status={it.status} detail={it.detail} />
        ))}
      </div>
    </Screen>
  )
}
