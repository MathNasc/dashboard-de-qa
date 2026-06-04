"use client"

import { Check, X, Loader2, Circle, MinusCircle, GitCommitHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Step, StepStatus } from "./data"

// Re-export for backwards compatibility with existing imports.
export type { Step } from "./data"

interface ExecutionStepperProps {
  steps: Step[]
}

const meta: Record<
  StepStatus,
  { text: string; node: string; line: string; label: string }
> = {
  completed: {
    text: "text-success",
    node: "bg-success/15 border-success text-success",
    line: "bg-success",
    label: "Concluído",
  },
  error: {
    text: "text-destructive",
    node: "bg-destructive/15 border-destructive text-destructive",
    line: "bg-destructive",
    label: "Falhou",
  },
  running: {
    text: "text-primary",
    node: "bg-primary/15 border-primary text-primary",
    line: "bg-primary/40",
    label: "Executando",
  },
  pending: {
    text: "text-muted-foreground",
    node: "bg-muted border-border text-muted-foreground",
    line: "bg-border",
    label: "Pendente",
  },
  skipped: {
    text: "text-muted-foreground",
    node: "bg-muted border-border text-muted-foreground",
    line: "bg-border",
    label: "Ignorado",
  },
}

function StepGlyph({ status }: { status: StepStatus }) {
  const Icon =
    status === "completed"
      ? Check
      : status === "error"
        ? X
        : status === "running"
          ? Loader2
          : status === "skipped"
            ? MinusCircle
            : Circle
  return (
    <Icon className={cn("h-4.5 w-4.5", status === "running" && "animate-spin")} />
  )
}

export function ExecutionStepper({ steps }: ExecutionStepperProps) {
  const total = steps.length
  const done = steps.filter((s) => s.status === "completed").length
  const hasError = steps.some((s) => s.status === "error")
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCommitHorizontal className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Linha do Tempo da Execução</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {done}/{total} etapas · {pct}%
        </span>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-0">
        {steps.map((step, index) => {
          const m = meta[step.status] ?? meta.pending
          const isLast = index === steps.length - 1
          return (
            <div key={step.id} className="group relative flex flex-1 md:flex-col md:items-center">
              {/* Connector (desktop) */}
              {!isLast && (
                <div className="absolute left-[18px] top-9 h-[calc(100%-12px)] w-0.5 md:left-1/2 md:top-[18px] md:h-0.5 md:w-full md:translate-x-[18px] bg-border">
                  <div
                    className={cn(
                      "h-full w-full origin-left transition-transform duration-500",
                      step.status === "completed" ? m.line : "scale-x-0",
                      step.status === "error" && "bg-destructive scale-x-100",
                    )}
                  />
                </div>
              )}

              <div className="flex items-start gap-3 md:flex-col md:items-center md:gap-0">
                <div
                  className={cn(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform group-hover:scale-110",
                    m.node,
                    step.status === "error" && "animate-pulse",
                  )}
                >
                  <StepGlyph status={step.status} />
                  {step.status === "running" && (
                    <span className="absolute inset-0 rounded-full animate-pulse-ring" />
                  )}
                </div>

                <div className="md:mt-2 md:text-center">
                  <p className={cn("text-sm font-medium leading-tight", m.text)}>{step.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{m.label}</p>
                  {step.duration && (
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/80">
                      {step.duration}
                    </p>
                  )}
                </div>
              </div>

              {/* Hover detail card */}
              {(step.startedAt || step.finishedAt || step.duration) && (
                <div
                  className={cn(
                    "pointer-events-none absolute left-12 top-0 z-20 w-44 rounded-lg border border-border bg-popover p-3 text-left opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100",
                    "md:left-1/2 md:top-full md:mt-2 md:-translate-x-1/2",
                  )}
                  role="tooltip"
                >
                  <p className="mb-1.5 text-xs font-semibold text-foreground">{step.name}</p>
                  <dl className="space-y-1 text-[11px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Início</dt>
                      <dd className="font-mono text-foreground">{step.startedAt ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Término</dt>
                      <dd className="font-mono text-foreground">{step.finishedAt ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Duração</dt>
                      <dd className="font-mono text-foreground">{step.duration ?? "—"}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {hasError && (
        <p className="mt-5 flex items-center gap-1.5 text-xs text-destructive">
          <X className="h-3.5 w-3.5" />
          Execução interrompida por falha em uma das etapas.
        </p>
      )}
    </section>
  )
}
