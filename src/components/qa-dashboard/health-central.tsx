"use client"

import {
  Activity,
  AlertOctagon,
  Bot,
  Clock,
  Gauge,
  ShieldCheck,
  Timer,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  activeIncidents,
  queueOverview,
  robotHealthLabels,
  robotsHealth,
  slaOverview,
  type IncidentSeverity,
  type RobotHealthStatus,
} from "./data"

const healthBadge: Record<RobotHealthStatus, string> = {
  healthy: "bg-success/10 text-success ring-success/30",
  degraded: "bg-warning/10 text-warning ring-warning/30",
  down: "bg-destructive/10 text-destructive ring-destructive/30",
  maintenance: "bg-info/10 text-info ring-info/30",
}

const severityBadge: Record<IncidentSeverity, string> = {
  P1: "bg-destructive/15 text-destructive ring-destructive/40",
  P2: "bg-warning/15 text-warning ring-warning/40",
  P3: "bg-info/15 text-info ring-info/30",
}

const incidentStatusLabel = {
  open: "Aberto",
  investigating: "Em investigação",
  mitigated: "Mitigado",
}

export function HealthCentral() {
  return (
    <div className="space-y-5">
      {/* Top: SLA + Queue + Incidents quick gauges */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SlaPanel />
        <QueuePanel />
        <IncidentsPanel />
      </div>

      {/* Robots health table */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <header className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Saúde da Frota de Robôs</h3>
            <p className="text-[11px] text-muted-foreground">
              {robotsHealth.length} robôs monitorados em tempo real
            </p>
          </div>
        </header>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2.5">Robô</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Uptime</th>
                <th className="px-3 py-2.5 text-right">Sucesso</th>
                <th className="px-3 py-2.5 text-right">SLA</th>
                <th className="px-3 py-2.5 text-right">Fila</th>
                <th className="px-3 py-2.5 text-right">Tempo médio</th>
                <th className="px-5 py-2.5 text-right">Última execução</th>
              </tr>
            </thead>
            <tbody>
              {robotsHealth.map((r) => {
                const slaOk = r.successRate >= r.slaTarget
                return (
                  <tr
                    key={r.id}
                    className="border-b border-border/70 transition-colors hover:bg-secondary/30 last:border-0"
                  >
                    <td className="px-5 py-3">
                      <p className="font-mono text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">Squad {r.squad}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                          healthBadge[r.status],
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {robotHealthLabels[r.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs tabular-nums text-foreground">
                      {r.uptimePct}%
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs tabular-nums text-foreground">
                      {r.successRate}%
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold",
                          slaOk
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {slaOk ? "OK" : "Em risco"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs tabular-nums text-foreground">
                      {r.queueDepth}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {r.avgDuration}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                      {r.lastRun}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function SlaPanel() {
  const pct = Math.max(0, Math.min(100, slaOverview.current))
  const dash = `${pct} ${100 - pct}`
  const ok = pct >= slaOverview.target
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">SLA Global</h3>
          <p className="text-[11px] text-muted-foreground">
            Meta {slaOverview.target}% · janela 30d
          </p>
        </div>
      </header>

      <div className="flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--border)" strokeWidth="3.2" />
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke={ok ? "var(--success)" : "var(--destructive)"}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray={dash}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
              {slaOverview.current}%
            </span>
            <span className="text-[10px] text-muted-foreground">atual</span>
          </div>
        </div>

        <dl className="grid flex-1 grid-cols-2 gap-2 text-xs">
          <Stat icon={Gauge} label="Error budget" value={`${slaOverview.errorBudgetRemaining}%`} />
          <Stat icon={Timer} label="MTTR" value={`${slaOverview.mttrMinutes}m`} />
          <Stat icon={Clock} label="MTTD" value={`${slaOverview.mttdMinutes}m`} />
          <Stat
            icon={Activity}
            label="Tendência"
            value={`${slaOverview.trend > 0 ? "+" : ""}${slaOverview.trend}%`}
            tone={slaOverview.trend < 0 ? "error" : "success"}
          />
        </dl>
      </div>
    </section>
  )
}

function QueuePanel() {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
          <Layers className="h-4 w-4 text-warning" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Fila de Execuções</h3>
          <p className="text-[11px] text-muted-foreground">
            {queueOverview.total} aguardando processamento
          </p>
        </div>
      </header>

      <ul className="space-y-2.5">
        {queueOverview.byPriority.map((p) => {
          const pct = (p.value / queueOverview.total) * 100
          const colorBar =
            p.tone === "error"
              ? "bg-destructive"
              : p.tone === "warning"
                ? "bg-warning"
                : "bg-info"
          return (
            <li key={p.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Prioridade {p.label}</span>
                <span className="font-mono font-semibold text-foreground">{p.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className={cn("h-full transition-all", colorBar)} style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function IncidentsPanel() {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
          <AlertOctagon className="h-4 w-4 text-destructive" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Incidentes Ativos</h3>
          <p className="text-[11px] text-muted-foreground">
            {activeIncidents.filter((i) => i.status !== "mitigated").length} abertos · {activeIncidents.length} no período
          </p>
        </div>
      </header>

      <ul className="space-y-2">
        {activeIncidents.map((i) => (
          <li
            key={i.id}
            className="rounded-lg border border-border bg-secondary/40 p-2.5 transition-colors hover:border-primary/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{i.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {i.id} · {i.robot} · abriu {i.openedAt} · {i.owner}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1",
                  severityBadge[i.severity],
                )}
              >
                {i.severity}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Status: <span className="text-foreground">{incidentStatusLabel[i.status]}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Activity
  label: string
  value: string
  tone?: "default" | "success" | "error"
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "error"
        ? "text-destructive"
        : "text-foreground"
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className={cn("mt-0.5 font-mono text-sm font-semibold tabular-nums", toneClass)}>
        {value}
      </p>
    </div>
  )
}
