"use client"

import { useState } from "react"
import {
  Bot,
  Calendar,
  Clock,
  Layers,
  Server,
  Zap,
  LayoutGrid,
  Stethoscope,
  ScrollText,
  Camera,
  History,
} from "lucide-react"
import { ExecutionStepper } from "./execution-stepper"
import { TerminalLog } from "./terminal-log"
import { ActionButtons } from "./action-buttons"
import { FailureAnalysis } from "./failure-analysis"
import { AiDiagnosisPanel } from "./ai-diagnosis"
import { StatusBadge, StatusIcon } from "./status-badge"
import { cn } from "@/lib/utils"
import { getRelatedExecutions, type Execution } from "./data"

interface ExecutionDetailProps {
  execution: Execution
  onViewScreenshot: () => void
  onForceStop: () => void
  onSelect?: (id: string) => void
}

type Tab = "overview" | "diagnosis" | "logs" | "evidence" | "history"

const tabs: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid },
  { id: "diagnosis", label: "Diagnóstico", icon: Stethoscope },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "evidence", label: "Evidências", icon: Camera },
  { id: "history", label: "Histórico", icon: History },
]

export function ExecutionDetail({
  execution,
  onViewScreenshot,
  onForceStop,
  onSelect,
}: ExecutionDetailProps) {
  const [tab, setTab] = useState<Tab>("overview")
  const history = getRelatedExecutions(execution.id, execution.robot, 8)

  return (
    <div className="animate-fade-in-up overflow-hidden rounded-xl border border-border bg-card/40">
      {/* Header */}
      <header className="border-b border-border bg-card/60 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                  {execution.name}
                </h1>
                <StatusBadge status={execution.status} />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <Meta icon={Calendar}>{execution.timestamp}</Meta>
                <Meta icon={Clock}>{execution.duration}</Meta>
                <Meta icon={Server}>{execution.robot}</Meta>
                <Meta icon={Layers}>{execution.category}</Meta>
                <Meta icon={Zap}>{execution.trigger}</Meta>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav
        role="tablist"
        aria-label="Investigação da execução"
        className="flex items-center gap-1 overflow-x-auto border-b border-border bg-card/40 px-3 scrollbar-thin"
      >
        {tabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          const isDiag = t.id === "diagnosis" && execution.failure
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {isDiag && (
                <span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Content */}
      <div className="space-y-5 p-5 sm:p-6">
        {tab === "overview" && (
          <>
            <ExecutionStepper steps={execution.steps} />
            {execution.failure && (
              <FailureAnalysis failure={execution.failure} onViewScreenshot={onViewScreenshot} />
            )}
          </>
        )}

        {tab === "diagnosis" &&
          (execution.failure ? (
            <div className="space-y-5">
              <FailureAnalysis failure={execution.failure} onViewScreenshot={onViewScreenshot} />
              <AiDiagnosisPanel execution={execution} />
            </div>
          ) : (
            <EmptyState
              icon={Stethoscope}
              title="Sem diagnóstico disponível"
              hint="Esta execução foi concluída com sucesso — não há falha para diagnosticar."
            />
          ))}

        {tab === "logs" && <TerminalLog logs={execution.logs} executionName={execution.name} />}

        {tab === "evidence" && (
          <EvidenceTab execution={execution} onViewScreenshot={onViewScreenshot} />
        )}

        {tab === "history" && (
          <HistoryTab executions={history} robot={execution.robot} onSelect={onSelect} />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/60 px-5 py-4 sm:px-6">
        <ActionButtons
          onViewScreenshot={onViewScreenshot}
          onForceStop={onForceStop}
          hasScreenshot={!!execution.failure?.screenshot}
          isRunning={execution.status === "running"}
        />
      </footer>
    </div>
  )
}

function Meta({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  )
}

function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Stethoscope
  title: string
  hint: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/30 px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function EvidenceTab({
  execution,
  onViewScreenshot,
}: {
  execution: Execution
  onViewScreenshot: () => void
}) {
  const errorLogs = execution.logs.filter((l) => l.level === "ERROR" || l.level === "WARN")
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-5">
        <header className="mb-3 flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Captura de Tela</h3>
        </header>
        {execution.failure?.screenshot ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-3">
            <span className="truncate font-mono text-xs text-muted-foreground">
              {execution.failure.screenshot}
            </span>
            <button
              onClick={onViewScreenshot}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/70"
            >
              <Camera className="h-3.5 w-3.5" />
              Abrir
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nenhuma captura registrada.</p>
        )}
      </section>

      {execution.failure?.selector && (
        <section className="rounded-xl border border-border bg-card p-5">
          <header className="mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">Seletor envolvido</h3>
          </header>
          <code className="block overflow-x-auto rounded-lg bg-terminal p-3 font-mono text-xs text-destructive scrollbar-thin">
            {execution.failure.selector}
          </code>
        </section>
      )}

      <section className="rounded-xl border border-border bg-card p-5">
        <header className="mb-3 flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-semibold text-foreground">
            Linhas de erro e advertência ({errorLogs.length})
          </h3>
        </header>
        {errorLogs.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sem ocorrências relevantes.</p>
        ) : (
          <ul className="space-y-1 font-mono text-xs">
            {errorLogs.map((l, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-muted-foreground/70">{l.time}</span>
                <span
                  className={cn(
                    "shrink-0 font-semibold",
                    l.level === "ERROR" ? "text-destructive" : "text-warning",
                  )}
                >
                  {l.level}
                </span>
                <span className="text-foreground/90">{l.message}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function HistoryTab({
  executions,
  robot,
  onSelect,
}: {
  executions: Execution[]
  robot: string
  onSelect?: (id: string) => void
}) {
  if (executions.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Sem execuções anteriores"
        hint={`Nenhum histórico recente registrado para o robô ${robot}.`}
      />
    )
  }
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-center gap-2 border-b border-border px-5 py-3">
        <History className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Últimas execuções de {robot}
        </h3>
      </header>
      <ul className="divide-y divide-border">
        {executions.map((e) => (
          <li key={e.id}>
            <button
              onClick={() => onSelect?.(e.id)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-secondary/40"
            >
              <StatusIcon status={e.status} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{e.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {e.timestamp} · {e.category} · {e.trigger}
                </p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{e.duration}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
