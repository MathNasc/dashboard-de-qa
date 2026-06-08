"use client"

import { useState } from "react"
import { LayoutDashboard, BarChart3, Circle, HeartPulse, Bell, Radio } from "lucide-react"
import { ExecutionSidebar } from "./execution-sidebar"
import { ExecutionDetail } from "./execution-detail"
import { InvestigationPanel } from "./investigation-panel"
import { KpiCards } from "./kpi-cards"
import { Analytics } from "./analytics"
import { HealthCentral } from "./health-central"
import { AlertsCenter } from "./alerts-center"
import { NocView } from "./noc-view"
import { AppHeader } from "./app-header"
import { CommandPalette } from "./command-palette"
import { executions, getKpis, recentAlertEvents } from "./data"
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

type View = "overview" | "health" | "noc" | "analytics" | "alerts"

export function QADashboard() {
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>("1")
  const [collapsed, setCollapsed] = useState(false)
  const [view, setView] = useState<View>("overview")
  const [showScreenshot, setShowScreenshot] = useState(false)
  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const selectedExecution =
    executions.find((e) => e.id === selectedExecutionId) ?? executions[0]
  const kpis = getKpis(executions)
  const unreadAlerts = recentAlertEvents.filter((e) => !e.acknowledged).length

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
        <AppHeader onOpenPalette={() => setPaletteOpen(true)} unreadAlerts={unreadAlerts} />

        {/* Tabs bar */}
        <div className="flex items-center justify-between gap-4 border-b border-border bg-card/20 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-secondary p-1 scrollbar-thin">
            <TabButton
              active={view === "overview"}
              onClick={() => setView("overview")}
              icon={LayoutDashboard}
              label="Visão Geral"
            />
            <TabButton
              active={view === "health"}
              onClick={() => setView("health")}
              icon={HeartPulse}
              label="Saúde Operacional"
            />
            <TabButton
              active={view === "noc"}
              onClick={() => setView("noc")}
              icon={Radio}
              label="NOC"
            />
            <TabButton
              active={view === "analytics"}
              onClick={() => setView("analytics")}
              icon={BarChart3}
              label="Analytics"
            />
            <TabButton
              active={view === "alerts"}
              onClick={() => setView("alerts")}
              icon={Bell}
              label="Alertas"
              badge={unreadAlerts}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Circle className="h-2 w-2 fill-success text-success animate-pulse" />
            <span className="hidden sm:inline">Ambiente</span>
            <span className="font-medium text-foreground">Produção</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
            <KpiCards kpis={kpis} />
            {view === "overview" && (
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
                <div className="min-w-0 flex-1">
                  <ExecutionDetail
                    execution={selectedExecution}
                    onViewScreenshot={() => setShowScreenshot(true)}
                    onForceStop={() => setShowStopConfirm(true)}
                    onSelect={setSelectedExecutionId}
                  />
                </div>
                <InvestigationPanel
                  execution={selectedExecution}
                  onSelect={setSelectedExecutionId}
                />
              </div>
            )}
            {view === "health" && <HealthCentral />}
            {view === "noc" && <NocView />}
            {view === "analytics" && <Analytics />}
            {view === "alerts" && <AlertsCenter />}

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

      {/* Command palette (Cmd/Ctrl + K) */}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNavigate={setView}
        onSelectExecution={setSelectedExecutionId}
      />
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: typeof LayoutDashboard
  label: string
  badge?: number
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
      {badge && badge > 0 ? (
        <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
          {badge}
        </span>
      ) : null}
    </button>
  )
}

