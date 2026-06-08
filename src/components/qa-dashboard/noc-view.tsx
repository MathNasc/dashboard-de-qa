"use client"

import { useEffect, useState } from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CircleDot,
  Radio,
  Server,
  Siren,
  Wrench,
  Wifi,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  activeIncidents,
  robotsHealth,
  robotHealthLabels,
  recentAlertEvents,
  slaOverview,
  queueOverview,
  type RobotHealthStatus,
} from "./data"

const statusStyles: Record<RobotHealthStatus, { dot: string; ring: string; label: string }> = {
  healthy: { dot: "bg-success", ring: "ring-success/30", label: "text-success" },
  degraded: { dot: "bg-warning animate-pulse", ring: "ring-warning/30", label: "text-warning" },
  down: { dot: "bg-destructive animate-pulse", ring: "ring-destructive/40", label: "text-destructive" },
  maintenance: { dot: "bg-info", ring: "ring-info/30", label: "text-info" },
}

const incidentTone: Record<string, string> = {
  P1: "border-destructive/40 bg-destructive/10 text-destructive",
  P2: "border-warning/40 bg-warning/10 text-warning",
  P3: "border-info/40 bg-info/10 text-info",
}

export function NocView() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const counts = robotsHealth.reduce(
    (acc, r) => {
      acc[r.status]++
      return acc
    },
    { healthy: 0, degraded: 0, down: 0, maintenance: 0 } as Record<RobotHealthStatus, number>,
  )

  return (
    <div className="space-y-5">
      {/* NOC header */}
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
            <Radio className="h-5 w-5 text-primary" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-ping rounded-full bg-success" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-success" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Centro de Operações em Rede</h2>
            <p className="text-xs text-muted-foreground">
              Monitoramento ao vivo · NOC AutoOps · Turno em andamento
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 font-mono text-sm text-foreground">
          <span className="flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 text-success" />
            <span className="text-xs text-muted-foreground">Streaming ativo</span>
          </span>
          <span className="rounded-md border border-border bg-secondary px-3 py-1 tabular-nums">
            {now.toLocaleTimeString("pt-BR")}
          </span>
        </div>
      </header>

      {/* Big metrics */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MegaStat
          icon={CheckCircle2}
          label="Robôs saudáveis"
          value={counts.healthy}
          total={robotsHealth.length}
          tone="success"
        />
        <MegaStat
          icon={AlertTriangle}
          label="Degradados"
          value={counts.degraded}
          total={robotsHealth.length}
          tone="warning"
        />
        <MegaStat
          icon={Siren}
          label="Indisponíveis"
          value={counts.down}
          total={robotsHealth.length}
          tone="error"
          pulse
        />
        <MegaStat
          icon={Wrench}
          label="Em manutenção"
          value={counts.maintenance}
          total={robotsHealth.length}
          tone="info"
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Fleet wall */}
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Frota de robôs — visão de parede</h3>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {robotsHealth.length} unidades monitoradas
            </span>
          </header>
          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {robotsHealth.map((r) => {
              const s = statusStyles[r.status]
              return (
                <div
                  key={r.id}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border border-border bg-card/80 p-4 transition-colors hover:bg-secondary/40",
                    "ring-1",
                    s.ring,
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-semibold text-foreground">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">{r.squad}</p>
                    </div>
                    <span className={cn("flex h-2.5 w-2.5 shrink-0 rounded-full", s.dot)} />
                  </div>
                  <p className={cn("mt-2 text-xs font-semibold uppercase tracking-wider", s.label)}>
                    {robotHealthLabels[r.status]}
                  </p>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <Stat label="Uptime" value={`${r.uptimePct}%`} />
                    <Stat label="Sucesso" value={`${r.successRate}%`} />
                    <Stat label="Fila" value={`${r.queueDepth}`} highlight={r.queueDepth > 5} />
                  </dl>
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {r.lastRun}
                    </span>
                    {r.incidents24h > 0 && (
                      <span className="flex items-center gap-1 text-destructive">
                        <Siren className="h-3 w-3" /> {r.incidents24h} 24h
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Live operations */}
        <div className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Pulso operacional</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">tempo real</span>
            </header>
            <div className="space-y-4 p-5">
              <PulseRow label="SLA atual" value={`${slaOverview.current}%`} target={`alvo ${slaOverview.target}%`} tone={slaOverview.current >= slaOverview.target ? "success" : "warning"} />
              <PulseRow label="MTTR" value={`${slaOverview.mttrMinutes} min`} target="média 7d" tone="info" />
              <PulseRow label="MTTD" value={`${slaOverview.mttdMinutes} min`} target="média 7d" tone="info" />
              <PulseRow label="Fila total" value={`${queueOverview.total}`} target="todas as filas" tone={queueOverview.total > 10 ? "warning" : "success"} />
              <PulseRow label="Orçamento de erro" value={`${slaOverview.errorBudgetRemaining}%`} target="restante no mês" tone={slaOverview.errorBudgetRemaining < 30 ? "error" : "success"} />
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Siren className="h-4 w-4 text-destructive" />
                <h3 className="text-sm font-semibold text-foreground">Incidentes ativos</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">{activeIncidents.length} em curso</span>
            </header>
            <ul className="divide-y divide-border">
              {activeIncidents.map((i) => (
                <li key={i.id} className="flex items-start gap-3 px-5 py-3">
                  <span
                    className={cn(
                      "inline-flex h-6 min-w-[2rem] shrink-0 items-center justify-center rounded-md border px-1.5 text-[11px] font-semibold",
                      incidentTone[i.severity],
                    )}
                  >
                    {i.severity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{i.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {i.robot} · aberto {i.openedAt} · {i.owner}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] capitalize text-muted-foreground">
                    {i.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Live ticker */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <CircleDot className="h-4 w-4 text-success animate-pulse" />
            <h3 className="text-sm font-semibold text-foreground">Ticker de eventos</h3>
          </div>
          <span className="text-[11px] text-muted-foreground">últimos disparos do dia</span>
        </header>
        <ul className="divide-y divide-border font-mono text-xs">
          {recentAlertEvents.slice(0, 8).map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-5 py-2.5">
              <span className="tabular-nums text-muted-foreground">{e.triggeredAt}</span>
              <span
                className={cn(
                  "inline-flex h-5 items-center rounded-md px-2 text-[10px] font-semibold uppercase",
                  e.severity === "critical"
                    ? "bg-destructive/15 text-destructive"
                    : e.severity === "warning"
                      ? "bg-warning/15 text-warning"
                      : "bg-info/15 text-info",
                )}
              >
                {e.severity}
              </span>
              <span className="text-foreground/80">{e.robot}</span>
              <span className="truncate text-muted-foreground">{e.message}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function MegaStat({
  icon: Icon,
  label,
  value,
  total,
  tone,
  pulse,
}: {
  icon: typeof Server
  label: string
  value: number
  total: number
  tone: "success" | "warning" | "error" | "info"
  pulse?: boolean
}) {
  const toneCls: Record<typeof tone, string> = {
    success: "text-success bg-success/10 ring-success/30",
    warning: "text-warning bg-warning/10 ring-warning/30",
    error: "text-destructive bg-destructive/10 ring-destructive/30",
    info: "text-info bg-info/10 ring-info/30",
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg ring-1", toneCls[tone])}>
          <Icon className={cn("h-4 w-4", pulse && "animate-pulse")} />
        </div>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold tabular-nums text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">/ {total}</span>
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded border border-border/60 bg-background/40 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-xs font-semibold", highlight ? "text-warning" : "text-foreground")}>
        {value}
      </div>
    </div>
  )
}

function PulseRow({
  label,
  value,
  target,
  tone,
}: {
  label: string
  value: string
  target: string
  tone: "success" | "warning" | "error" | "info"
}) {
  const toneCls: Record<typeof tone, string> = {
    success: "text-success",
    warning: "text-warning",
    error: "text-destructive",
    info: "text-info",
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground/70">{target}</p>
      </div>
      <span className={cn("font-mono text-lg font-semibold tabular-nums", toneCls[tone])}>{value}</span>
    </div>
  )
}
