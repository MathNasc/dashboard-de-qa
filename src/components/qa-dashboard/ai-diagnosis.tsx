"use client"

import { useState } from "react"
import { Sparkles, Loader2, AlertCircle, ShieldAlert, Lightbulb, GitBranch, Gauge, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { diagnoseExecution, type AiDiagnosis } from "@/lib/diagnose.functions"
import type { Execution } from "./data"
import { getSimilarFailures } from "./data"

interface AiDiagnosisPanelProps {
  execution: Execution
}

const confidenceTone: Record<AiDiagnosis["confidence"], string> = {
  alta: "bg-success/15 text-success ring-success/30",
  "média": "bg-warning/15 text-warning ring-warning/30",
  baixa: "bg-muted text-muted-foreground ring-border",
}

export function AiDiagnosisPanel({ execution }: AiDiagnosisPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AiDiagnosis | null>(null)

  async function run() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const similar = getSimilarFailures(execution.id, execution.failure?.category, 4).map(
        (s) => ({ name: s.name, when: s.timestamp, summary: s.failure?.summary }),
      )
      const errorLogs = execution.logs
        .filter((l) => l.level === "ERROR" || l.level === "WARN")
        .slice(-20)
        .map((l) => `[${l.time}] ${l.level} ${l.message}`)

      const data = await diagnoseExecution({
        data: {
          executionName: execution.name,
          robot: execution.robot,
          category: execution.category,
          status: execution.status,
          failureSummary: execution.failure?.summary,
          failureCategory: execution.failure?.category,
          rootCause: execution.failure?.rootCause,
          selector: execution.failure?.selector,
          errorLogs,
          similarFailures: similar,
        },
      })
      setResult(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao gerar diagnóstico"
      if (msg.includes("429")) {
        setError("Limite de requisições atingido. Tente novamente em instantes.")
      } else if (msg.includes("402")) {
        setError("Créditos do AutoOps AI esgotados. Atualize seu plano para continuar.")
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-primary/30 bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-primary/20 bg-primary/5 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Diagnóstico Inteligente</h3>
            <p className="text-[11px] text-muted-foreground">
              Análise aprofundada com IA do AutoOps
            </p>
          </div>
        </div>
        <Button size="sm" onClick={run} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analisando…
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              {result ? "Reanalisar" : "Aprofundar com IA"}
            </>
          )}
        </Button>
      </div>

      <div className="p-5">
        {!result && !loading && !error && (
          <p className="text-sm text-muted-foreground">
            Use a IA para correlacionar logs, falhas similares e gerar hipóteses de causa raiz,
            raio de impacto e plano de ação para esta execução.
          </p>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Correlacionando logs e falhas similares…
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-secondary/40 p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hipótese de causa raiz
                </span>
                <span
                  className={cn(
                    "ml-auto inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 capitalize",
                    confidenceTone[result.confidence],
                  )}
                >
                  Confiança: {result.confidence}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{result.rootCauseHypothesis}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile icon={Gauge} label="Raio de impacto" value={result.blastRadius} />
              <InfoTile icon={Radio} label="Padrão recorrente" value={result.recurringPattern} />
            </div>

            <div className="rounded-lg border border-success/25 bg-success/5 p-4">
              <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-success">
                <Lightbulb className="h-3.5 w-3.5" />
                Ações recomendadas
              </div>
              <ol className="space-y-2">
                {result.recommendedActions.map((a, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-foreground/90">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-[11px] font-semibold text-success">
                      {i + 1}
                    </span>
                    {a}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border border-info/25 bg-info/5 p-4">
              <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-info">
                <ShieldAlert className="h-3.5 w-3.5" />
                Medidas preventivas
              </div>
              <ul className="space-y-1.5 text-sm text-foreground/90">
                {result.preventiveMeasures.map((p, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-info" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Escalonamento sugerido: </span>
              {result.escalationSuggestion}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 text-sm text-foreground">{value}</p>
    </div>
  )
}
