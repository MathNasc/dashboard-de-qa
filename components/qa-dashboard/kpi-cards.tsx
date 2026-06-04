"use client"

import {
  Activity,
  Loader2,
  CheckCircle2,
  XCircle,
  Timer,
  Bot,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Kpi } from "./data"

const icons: Record<string, LucideIcon> = {
  today: Activity,
  running: Loader2,
  "success-rate": CheckCircle2,
  failures: XCircle,
  avg: Timer,
  robots: Bot,
}

const tones: Record<Kpi["tone"], { text: string; bg: string; line: string }> = {
  primary: { text: "text-primary", bg: "bg-primary/10", line: "var(--color-primary)" },
  success: { text: "text-success", bg: "bg-success/10", line: "var(--color-success)" },
  warning: { text: "text-warning", bg: "bg-warning/10", line: "var(--color-warning)" },
  error: { text: "text-destructive", bg: "bg-destructive/10", line: "var(--color-destructive)" },
  info: { text: "text-info", bg: "bg-info/10", line: "var(--color-info)" },
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 96
  const h = 32
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const points = data.map((v, i) => {
    const x = i * step
    const y = h - ((v - min) / range) * (h - 4) - 2
    return [x, y] as const
  })
  const line = points.map(([x, y]) => `${x},${y}`).join(" ")
  const area = `0,${h} ${line} ${w},${h}`
  const id = `spark-${color.replace(/[^a-z0-9]/gi, "")}`

  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.5" fill={color} />
    </svg>
  )
}

function DeltaBadge({ delta, positiveIsGood }: { delta: number; positiveIsGood: boolean }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
        <Minus className="h-3 w-3" />
        0%
      </span>
    )
  }
  const isUp = delta > 0
  const good = isUp === positiveIsGood
  const Icon = isUp ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
        good ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(delta)}%
    </span>
  )
}

export function KpiCards({ kpis }: { kpis: Kpi[] }) {
  return (
    <section
      aria-label="Indicadores executivos"
      className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
    >
      {kpis.map((kpi, i) => {
        const Icon = icons[kpi.id] ?? Activity
        const tone = tones[kpi.tone]
        return (
          <div
            key={kpi.id}
            style={{ animationDelay: `${i * 40}ms` }}
            className="group animate-fade-in-up rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tone.bg)}>
                <Icon
                  className={cn("h-4.5 w-4.5", tone.text, kpi.id === "running" && "animate-spin")}
                />
              </div>
              <DeltaBadge delta={kpi.delta} positiveIsGood={kpi.positiveIsGood} />
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {kpi.value}
              </span>
              <Sparkline data={kpi.spark} color={tone.line} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{kpi.hint}</p>
          </div>
        )
      })}
    </section>
  )
}
