"use client"

import { useMemo, useState } from "react"
import {
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Webhook,
  Smartphone,
  Users,
  Check,
  Pause,
  Play,
  Moon,
  AlertTriangle,
  ShieldAlert,
  Info,
  Plus,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  alertChannelLabels,
  alertRules,
  alertSeverityLabels,
  recentAlertEvents,
  type AlertChannel,
  type AlertRule,
  type AlertSeverity,
} from "./data"

const channelIcon: Record<AlertChannel, typeof Mail> = {
  email: Mail,
  slack: MessageSquare,
  teams: Users,
  webhook: Webhook,
  sms: Smartphone,
}

const severityStyles: Record<
  AlertSeverity,
  { icon: typeof AlertTriangle; badge: string; dot: string; text: string }
> = {
  critical: {
    icon: ShieldAlert,
    badge: "border-destructive/40 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
    text: "text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    badge: "border-warning/40 bg-warning/10 text-warning",
    dot: "bg-warning",
    text: "text-warning",
  },
  info: {
    icon: Info,
    badge: "border-info/40 bg-info/10 text-info",
    dot: "bg-info",
    text: "text-info",
  },
}

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const s = severityStyles[severity]
  const Icon = s.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        s.badge,
      )}
    >
      <Icon className="h-3 w-3" />
      {alertSeverityLabels[severity]}
    </span>
  )
}

function StatusPill({ status }: { status: AlertRule["status"] }) {
  if (status === "active")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
        Ativa
      </span>
    )
  if (status === "paused")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        <Pause className="h-2.5 w-2.5" />
        Pausada
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-info/15 px-2 py-0.5 text-[10px] font-medium text-info">
      <Moon className="h-2.5 w-2.5" />
      Silenciada
    </span>
  )
}

function Summary() {
  const totals = useMemo(() => {
    const active = alertRules.filter((r) => r.status === "active").length
    const triggers = alertRules.reduce((acc, r) => acc + r.triggers24h, 0)
    const critical = recentAlertEvents.filter((e) => e.severity === "critical").length
    const unack = recentAlertEvents.filter((e) => !e.acknowledged).length
    return { active, triggers, critical, unack }
  }, [])

  const cards = [
    { label: "Regras ativas", value: totals.active, icon: BellRing, tone: "text-primary" },
    { label: "Disparos nas últimas 24h", value: totals.triggers, icon: Bell, tone: "text-warning" },
    { label: "Eventos críticos", value: totals.critical, icon: ShieldAlert, tone: "text-destructive" },
    { label: "Não reconhecidos", value: totals.unack, icon: AlertTriangle, tone: "text-warning" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {c.label}
              </p>
              <Icon className={cn("h-4 w-4", c.tone)} />
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold text-foreground">{c.value}</p>
          </div>
        )
      })}
    </div>
  )
}

function RuleRow({ rule }: { rule: AlertRule }) {
  return (
    <div className="grid grid-cols-12 gap-3 border-b border-border/60 px-4 py-3 text-xs last:border-b-0 hover:bg-secondary/40">
      <div className="col-span-12 md:col-span-5">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={rule.severity} />
          <span className="font-medium text-foreground">{rule.name}</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{rule.description}</p>
      </div>
      <div className="col-span-6 md:col-span-2">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Condição</p>
        <p className="mt-0.5 font-mono text-[11px] text-foreground">
          {rule.metric} {rule.condition} {rule.threshold}
        </p>
      </div>
      <div className="col-span-6 md:col-span-2">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Canais</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {rule.channels.map((c) => {
            const Icon = channelIcon[c]
            return (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
                title={alertChannelLabels[c]}
              >
                <Icon className="h-2.5 w-2.5" />
                {alertChannelLabels[c]}
              </span>
            )
          })}
        </div>
      </div>
      <div className="col-span-6 md:col-span-2">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Disparos 24h</p>
        <p className="mt-0.5 font-mono text-[11px] text-foreground">
          {rule.triggers24h}
          {rule.lastTriggered ? (
            <span className="ml-1 text-muted-foreground">· último {rule.lastTriggered}</span>
          ) : null}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">Owner: {rule.owner}</p>
      </div>
      <div className="col-span-6 flex items-center justify-end gap-2 md:col-span-1">
        <StatusPill status={rule.status} />
        <button
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={rule.status === "active" ? "Pausar regra" : "Ativar regra"}
        >
          {rule.status === "active" ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}

function EventRow({
  event,
  onAck,
}: {
  event: (typeof recentAlertEvents)[number] & { acknowledged: boolean }
  onAck: (id: string) => void
}) {
  const s = severityStyles[event.severity]
  const ChannelIcon = channelIcon[event.channel]
  return (
    <div className="flex items-start gap-3 border-b border-border/60 px-4 py-3 last:border-b-0">
      <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", s.dot)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={event.severity} />
          <span className="text-xs font-medium text-foreground">{event.ruleName}</span>
          <span className="text-[11px] text-muted-foreground">
            · {event.robot} · {event.triggeredAt}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{event.message}</p>
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
          <ChannelIcon className="h-3 w-3" />
          enviado via {alertChannelLabels[event.channel]}
        </div>
      </div>
      {event.acknowledged ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
          <Check className="h-3 w-3" />
          Reconhecido
        </span>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="h-7 shrink-0 text-[11px]"
          onClick={() => onAck(event.id)}
        >
          Reconhecer
        </Button>
      )}
    </div>
  )
}

function ChannelsPanel() {
  const channels: { id: AlertChannel; status: "Conectado" | "Pendente"; detail: string }[] = [
    { id: "slack", status: "Conectado", detail: "#autoops-alerts" },
    { id: "teams", status: "Conectado", detail: "Canal Operações" },
    { id: "email", status: "Conectado", detail: "ops@empresa.com" },
    { id: "sms", status: "Conectado", detail: "Plantão NOC" },
    { id: "webhook", status: "Pendente", detail: "Aguardando configuração" },
  ]
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Canais de Notificação</h3>
          <p className="text-[11px] text-muted-foreground">
            Roteamento por severidade e squad responsável
          </p>
        </div>
        <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]">
          <Plus className="h-3 w-3" />
          Adicionar
        </Button>
      </div>
      <ul className="divide-y divide-border/60">
        {channels.map((c) => {
          const Icon = channelIcon[c.id]
          const ok = c.status === "Conectado"
          return (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{alertChannelLabels[c.id]}</p>
                  <p className="text-[11px] text-muted-foreground">{c.detail}</p>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  ok
                    ? "bg-success/15 text-success"
                    : "bg-warning/15 text-warning",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-success" : "bg-warning")} />
                {c.status}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function AlertsCenter() {
  const [query, setQuery] = useState("")
  const [ackMap, setAckMap] = useState<Record<string, boolean>>({})

  const events = useMemo(
    () =>
      recentAlertEvents.map((e) => ({
        ...e,
        acknowledged: ackMap[e.id] ?? e.acknowledged,
      })),
    [ackMap],
  )

  const filteredRules = useMemo(() => {
    if (!query.trim()) return alertRules
    const q = query.toLowerCase()
    return alertRules.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.metric.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="space-y-4">
      <Summary />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Regras de Alerta</h3>
              <p className="text-[11px] text-muted-foreground">
                Limiares, severidade, canais e responsáveis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar regra..."
                  className="h-8 w-44 pl-7 text-xs"
                />
              </div>
              <Button size="sm" className="h-8 gap-1 text-[11px]">
                <Plus className="h-3 w-3" />
                Nova regra
              </Button>
            </div>
          </div>
          <div>
            {filteredRules.map((r) => (
              <RuleRow key={r.id} rule={r} />
            ))}
            {filteredRules.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                Nenhuma regra encontrada.
              </p>
            )}
          </div>
        </div>

        <ChannelsPanel />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Eventos Recentes</h3>
            <p className="text-[11px] text-muted-foreground">
              Últimos disparos roteados aos canais
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            onClick={() => {
              const all: Record<string, boolean> = {}
              recentAlertEvents.forEach((e) => (all[e.id] = true))
              setAckMap(all)
            }}
          >
            Reconhecer todos
          </Button>
        </div>
        <div>
          {events.map((e) => (
            <EventRow
              key={e.id}
              event={e}
              onAck={(id) => setAckMap((m) => ({ ...m, [id]: true }))}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
