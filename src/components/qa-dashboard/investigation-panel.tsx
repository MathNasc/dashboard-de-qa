"use client"

import { Bot, AlertTriangle, History, Link2, Users, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusIcon } from "./status-badge"
import {
  getRelatedExecutions,
  getSimilarFailures,
  robotsHealth,
  type Execution,
  robotHealthLabels,
} from "./data"

interface InvestigationPanelProps {
  execution: Execution
  onSelect: (id: string) => void
}

const healthTone: Record<string, string> = {
  healthy: "text-success",
  degraded: "text-warning",
  down: "text-destructive",
  maintenance: "text-info",
}

export function InvestigationPanel({ execution, onSelect }: InvestigationPanelProps) {
  const related = getRelatedExecutions(execution.id, execution.robot)
  const similar = getSimilarFailures(execution.id, execution.failure?.category)
  const robot = robotsHealth.find((r) => r.id === execution.robot)

  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-4 xl:flex">
      {/* Impact summary */}
      <Section icon={AlertTriangle} title="Resumo de Impacto" tone="warning">
        <dl className="space-y-2 text-xs">
          <Row label="Status" value={execution.status === "error" ? "Falha detectada" : "Operacional"} />
          <Row label="Severidade" value={execution.failure?.impact ?? "—"} />
          <Row label="Ambiente" value={execution.environment} />
          <Row label="Trigger" value={execution.trigger} />
          <Row label="Categoria" value={execution.category} />
        </dl>
      </Section>

      {/* Robot health */}
      {robot && (
        <Section icon={Bot} title="Saúde do Robô" tone="primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm font-semibold text-foreground">{robot.name}</p>
              <p className="text-[11px] text-muted-foreground">Squad {robot.squad}</p>
            </div>
            <span className={cn("text-xs font-semibold", healthTone[robot.status])}>
              {robotHealthLabels[robot.status]}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <Metric label="Uptime" value={`${robot.uptimePct}%`} />
            <Metric label="Sucesso" value={`${robot.successRate}%`} />
            <Metric label="Fila" value={String(robot.queueDepth)} />
            <Metric label="Incidentes 24h" value={String(robot.incidents24h)} />
          </div>
        </Section>
      )}

      {/* Related executions same robot */}
      <Section icon={History} title="Execuções do mesmo robô" tone="info">
        {related.length === 0 ? (
          <Empty>Sem execuções recentes deste robô.</Empty>
        ) : (
          <ul className="space-y-1.5">
            {related.map((e) => (
              <ListItem key={e.id} execution={e} onClick={() => onSelect(e.id)} />
            ))}
          </ul>
        )}
      </Section>

      {/* Similar failures */}
      {execution.failure && (
        <Section icon={Link2} title="Falhas similares" tone="error">
          {similar.length === 0 ? (
            <Empty>Nenhuma falha similar registrada.</Empty>
          ) : (
            <ul className="space-y-1.5">
              {similar.map((e) => (
                <ListItem key={e.id} execution={e} onClick={() => onSelect(e.id)} />
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* Stakeholders */}
      <Section icon={Users} title="Responsáveis" tone="primary">
        <ul className="space-y-1.5 text-xs">
          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">Squad</span>
            <span className="font-medium text-foreground">{execution.category}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">On-call</span>
            <span className="font-medium text-foreground">Maria Costa</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">Plantão QA</span>
            <span className="font-medium text-foreground">João Lima</span>
          </li>
        </ul>
      </Section>
    </aside>
  )
}

function Section({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: typeof Activity
  title: string
  tone: "primary" | "warning" | "error" | "info"
  children: React.ReactNode
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    error: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  }
  return (
    <section className="rounded-xl border border-border bg-card/60 p-4">
      <header className="mb-3 flex items-center gap-2">
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", tones[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</h4>
      </header>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium text-foreground">{value}</dd>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/50 p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-center text-[11px] text-muted-foreground">{children}</p>
}

function ListItem({ execution, onClick }: { execution: Execution; onClick: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className="group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-secondary/60"
      >
        <StatusIcon status={execution.status} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">{execution.name}</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {execution.timestamp} · {execution.duration}
          </p>
        </div>
      </button>
    </li>
  )
}
