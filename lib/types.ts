export type AcType = 'MEP' | 'SEP'
export type ApchType = '3D' | '2D' | 'circ'

export interface FlightSetup {
  dep: string
  dest: string
  acType: AcType
  etd: string // HH:MM UTC
  eta: string // HH:MM UTC
}

export interface ApchMinima {
  type: ApchType
  dh: number   // ft
  rvr: number  // m
  ceil?: number // ft — required for 2D/circ
}

export interface WxObservation {
  raw: string
  ceiling: number | null  // ft, null = unknown, 9999 = clear
  vis: number | null      // m
  rvr: number | null      // m
  name?: string
}

export interface Notam {
  ref: string
  msg: string
  crit: boolean
  read: boolean
}

export interface PlanningResult {
  // Départ
  depOk: boolean
  depReason: string
  depWx: WxObservation | null
  takeoffAlt: boolean
  // Destination
  destAlts: 0 | 1 | 2
  destOk: boolean
  destExcellent: boolean
  destReason: string
  destWx: WxObservation | null
  destSource: 'TAF' | 'METAR' | null
}

export interface AppState {
  screen: Screen
  setup: FlightSetup
  depMinima: ApchMinima
  destMinima: ApchMinima
  depNotams: Notam[]
  destNotams: Notam[]
  result: PlanningResult | null
  loading: LoadingState
}

export type Screen =
  | 'setup'
  | 'minima'
  | 'loading'
  | 'notam'
  | 'departure'
  | 'destination'
  | 'summary'

export interface LoadingItem {
  id: string
  label: string
  status: 'wait' | 'run' | 'ok' | 'err'
  detail?: string
}

export type LoadingState = LoadingItem[]
