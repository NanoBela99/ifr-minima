'use client'
import { ReactNode } from 'react'

// ── Top Bar ──────────────────────────────────────────────────────────────────
interface TopBarProps {
  dep: string
  dest: string
  acType: string
  stepName: string
  dotActive: number // 0-3
}
export function TopBar({ dep, dest, acType, stepName, dotActive }: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-navy">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl font-semibold text-white tracking-wider">
            {dep || 'DEP'}
          </span>
          <div className="relative w-7 h-[1.5px] bg-white/20">
            <span className="absolute -right-1.5 -top-[5px] text-[9px] text-white/20">▶</span>
          </div>
          <span className="font-mono text-xl font-semibold text-white tracking-wider">
            {dest || 'DEST'}
          </span>
          <span className="font-display text-[13px] font-bold text-white/50 bg-white/10 px-2.5 py-0.5 rounded">
            {acType}
          </span>
        </div>
        <span className="text-[12px] text-white/50 font-medium">{stepName}</span>
      </div>
      <div className="flex gap-[5px] px-5 pb-3 max-w-2xl mx-auto">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-[3px] rounded-sm transition-all duration-300 ${
              i < dotActive
                ? 'bg-emerald-400'
                : i === dotActive
                ? 'bg-white'
                : 'bg-white/15'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Screen wrapper ────────────────────────────────────────────────────────────
export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="pt-[88px] pb-28 px-4 max-w-2xl mx-auto">
      {children}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
interface SHeadProps {
  step: string
  title: string | ReactNode
  sub?: string
}
export function SHead({ step, title, sub }: SHeadProps) {
  return (
    <div className="mb-5">
      <p className="font-display text-[13px] font-bold text-brand uppercase tracking-[.1em] mb-1">
        {step}
      </p>
      <h1 className="font-display text-[32px] font-extrabold text-navy leading-tight">
        {title}
      </h1>
      {sub && <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed">{sub}</p>}
    </div>
  )
}

// ── Bottom action bar ─────────────────────────────────────────────────────────
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-4"
      style={{
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(to top, #F0F4F9 70%, transparent)',
      }}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-2">{children}</div>
    </div>
  )
}

// ── Segment control ───────────────────────────────────────────────────────────
interface SegOption {
  value: string
  label: string
}
interface SegmentProps {
  options: SegOption[]
  value: string
  onChange: (v: string) => void
}
export function Segment({ options, value, onChange }: SegmentProps) {
  return (
    <div className="seg-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`seg-btn ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Loading indicator ─────────────────────────────────────────────────────────
type LIStatus = 'wait' | 'run' | 'ok' | 'err'
interface LoadItemProps {
  label: string
  status: LIStatus
  detail?: string
}
export function LoadItem({ label, status, detail }: LoadItemProps) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-black/[0.06] last:border-0">
      <div className="w-[22px] h-[22px] flex-shrink-0 flex items-center justify-center">
        {status === 'run' && (
          <div
            className="w-[22px] h-[22px] rounded-full border-[2.5px] border-slate-200 border-t-brand"
            style={{ animation: 'spin .7s linear infinite' }}
          />
        )}
        {status === 'wait' && (
          <div className="w-[22px] h-[22px] rounded-full bg-slate-200" />
        )}
        {status === 'ok' && (
          <div className="w-[22px] h-[22px] rounded-full bg-emerald-500 flex items-center justify-center text-white text-[11px] font-bold">
            ✓
          </div>
        )}
        {status === 'err' && (
          <div className="w-[22px] h-[22px] rounded-full bg-amber-500 flex items-center justify-center text-white text-[11px] font-bold">
            !
          </div>
        )}
      </div>
      <span className="flex-1 text-[15px] font-medium text-navy">{label}</span>
      <span className="text-[12px] text-slate-400 text-right max-w-[160px] leading-snug">
        {detail ||
          (status === 'wait' ? 'En attente' : status === 'run' ? 'Chargement…' : status === 'ok' ? 'OK' : '—')}
      </span>
    </div>
  )
}

// ── SIA external link ─────────────────────────────────────────────────────────
interface SiaLinkProps {
  href: string
  label: string
}
export function SiaLink({ href, label }: SiaLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between px-4 py-3.5 bg-blue-50 rounded-xl
                 border border-blue-200 text-brand font-semibold text-[14px] mb-3 no-underline"
    >
      <span>{label}</span>
      <span className="text-[18px]">↗</span>
    </a>
  )
}

// ── Summary row ───────────────────────────────────────────────────────────────
type SumRowType = 'ok' | 'fail' | 'warn' | 'info'
interface SumRowProps {
  type: SumRowType
  icon: string
  title: string
  detail: string
}
export function SumRow({ type, icon, title, detail }: SumRowProps) {
  const colors: Record<SumRowType, string> = {
    ok: 'bg-emerald-500',
    fail: 'bg-red-500',
    warn: 'bg-amber-500',
    info: 'bg-brand',
  }
  return (
    <div className="flex items-start gap-3 py-3 border-b border-black/[0.06] last:border-0">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center
                    text-white text-[13px] font-bold flex-shrink-0 mt-0.5 ${colors[type]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[15px] font-semibold text-navy">{title}</p>
        <p className="text-[13px] text-slate-400 mt-0.5 leading-relaxed">{detail}</p>
      </div>
    </div>
  )
}

// ── Minima alt grid ───────────────────────────────────────────────────────────
export function AltMinimaGrid() {
  const rows = [
    { type: 'Type B (ILS I · LPV…)', ceil: 'DH+200 ft', vis: 'RVR+800 m' },
    { type: 'Type A (NPA)', ceil: 'MDH+400 ft', vis: 'RVR+1500 m' },
    { type: 'Circling', ceil: 'MDH+400 ft', vis: 'VIS+1500 m' },
  ]
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {rows.map((r) => (
        <div key={r.type} className="bg-slate-50 rounded-xl p-2.5 border border-black/[0.07]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 leading-tight">
            {r.type}
          </p>
          <p className="font-mono text-[12px] font-semibold text-navy leading-snug">
            {r.ceil}
            <br />
            {r.vis}
          </p>
        </div>
      ))}
    </div>
  )
}

// Global spin keyframe (injected once)
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
  document.head.appendChild(style)
}
