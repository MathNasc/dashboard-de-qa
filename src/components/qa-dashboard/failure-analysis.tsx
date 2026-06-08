"use client"

import {
  AlertTriangle,
  Tag,
  Gauge,
  Crosshair,
  Lightbulb,
  Camera,
  Code2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { FailureAnalysis as FailureAnalysisType } from "./data"

const impactStyles: Record<FailureAnalysisType["impact"], string> = {
  "Crítico": "bg-destructive/15 text-destructive ring-destructive/30",
  Alto: "bg-destructive/10 text-destructive ring-destructive/25",
  "Médio": "bg-warning/15 text-warning ring-warning/30",
  Baixo: "bg-info/15 text-info ring-info/30",
}

export function FailureAnalysis({
  failure,
  onViewScreenshot,
}: {
  failure: FailureAnalysisType
  onViewScreenshot: () => void
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-destructive/30 bg-card">
      <div className="flex items-center gap-2.5 border-b border-destructive/20 bg-destructive/5 px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15 ring-1 ring-destructive/30">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Central de Diagnóstico</h3>
          <p className="text-[11px] text-muted-foreground">Análise da falha desta execução</p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {/* Summary */}
        <p className="text-sm leading-relaxed text-foreground">{failure.summary}</p>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Meta icon={Tag} label="Categoria" value={failure.category} />
          <div className="rounded-lg border border-border bg-secondary/50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              Impacto
            </div>
            <span
              className={cn(
                "mt-1.5 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
                impactStyles[failure.impact],
              )}
            >
              {failure.impact}
            </span>
          </div>
          <Meta icon={Crosshair} label="Tipo" value="Automação RPA" />
        </div>

        {/* Root cause */}
        <div className="rounded-lg border border-border bg-secondary/40 p-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Crosshair className="h-3.5 w-3.5 text-warning" />
            Possível Causa Raiz
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{failure.rootCause}</p>
        </div>

        {/* Evidence: selector */}
        {failure.selector && (
          <div className="rounded-lg border border-border bg-terminal p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              Evidência — Seletor
            </div>
            <code className="block overflow-x-auto rounded bg-black/30 p-2.5 font-mono text-xs text-destructive scrollbar-thin">
              {failure.selector}
            </code>
          </div>
        )}

        {/* Suggestions */}
        <div className="rounded-lg border border-success/25 bg-success/5 p-4">
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-success">
            <Lightbulb className="h-3.5 w-3.5" />
            Sugestões de Correção
          </div>
          <ul className="space-y-2">
            {failure.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-foreground/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-[11px] font-semibold text-success">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Screenshot evidence */}
        {failure.screenshot && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Camera className="h-4 w-4" />
              <span className="font-mono text-xs">{failure.screenshot}</span>
            </div>
            <Button size="sm" variant="outline" onClick={onViewScreenshot} className="gap-2">
              <Camera className="h-3.5 w-3.5" />
              Ver Captura
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
