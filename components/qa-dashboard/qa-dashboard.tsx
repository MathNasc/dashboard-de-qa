"use client"

import { useState } from "react"
import { LayoutDashboard, BarChart3, Circle } from "lucide-react"
import { ExecutionSidebar } from "./execution-sidebar"
import { ExecutionDetail } from "./execution-detail"
import { KpiCards } from "./kpi-cards"
import { Analytics } from "./analytics"
import { executions, getKpis } from "./data"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type View = "overview" | "analytics"

export function QADashboard() {
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>("1")
  const [collapsed, setCollapsed] = useState(false)
  const [view, setView] = useState<View>("overview")
  const [showScreenshot, setShowScreenshot] = useState(false)
  const [showStopConfirm, setShowStopConfirm] = useState(false)

  const selectedExecution =
    executions.find((e) => e.id === selectedExecutionId) ?? executions[0]
  const kpis = getKpis(executions)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ExecutionSidebar
        executions={executions}
        selectedId={selectedExecutionId}
        onSelect={setSelectedExecutionId}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 border-b border-border bg-card/30 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-1">
            <TabButton
              active={view === "overview"}
              onClick={() => setView("overview")}
              icon={LayoutDashboard}
              label="Visão Geral"
            />
            <TabButton
              active={view === "analytics"}
              onClick={() => setView("analytics")}
              icon={BarChart3}
              label="Analytics"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Circle className="h-2 w-2 fill-success text-success" />
            <span className="hidden sm:inline">Ambiente</span>
            <span className="font-medium text-foreground">Produção</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
            <KpiCards kpis={kpis} />
            {view === "overview" ? (
              <ExecutionDetail
                execution={selectedExecution}
                onViewScreenshot={() => setShowScreenshot(true)}
                onForceStop={() => setShowStopConfirm(true)}
              />
            ) : (
              <Analytics />
            )}
          </div>
        </div>
      </main>

      {/* Screenshot Dialog */}
      <Dialog open={showScreenshot} onOpenChange={setShowScreenshot}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Captura de Tela do Erro</DialogTitle>
            <DialogDescription>Captura do momento em que o erro ocorreu</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-4">
            <p className="mb-2 text-center font-mono text-sm text-muted-foreground">
              {selectedExecution.failure?.screenshot ?? "Nenhuma captura disponível"}
            </p>
            <div className="flex h-64 w-full items-center justify-center rounded border border-border bg-terminal">
              <span className="font-mono text-xs text-terminal-foreground">
                [Imagem da captura de tela seria exibida aqui]
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Force Stop Confirmation */}
      <AlertDialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Parada Forçada</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja forçar a parada desta execução? Esta ação não pode ser
              desfeita e pode deixar o sistema em estado inconsistente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setShowStopConfirm(false)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Forçar Parada
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof LayoutDashboard
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}
