"use client"

import { Bot, Calendar, Clock, AlertCircle } from "lucide-react"
import { ExecutionStepper, type Step } from "./execution-stepper"
import { TerminalLog } from "./terminal-log"
import { ActionButtons } from "./action-buttons"
import type { Execution } from "./execution-sidebar"

interface ExecutionDetailProps {
  execution: Execution
  steps: Step[]
  logs: string[]
  errorDetails?: {
    selector: string
    screenshot?: string
  }
  onViewScreenshot: () => void
  onForceStop: () => void
}

export function ExecutionDetail({
  execution,
  steps,
  logs,
  errorDetails,
  onViewScreenshot,
  onForceStop,
}: ExecutionDetailProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="p-6 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {execution.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {execution.timestamp}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {execution.duration}
                </span>
              </div>
            </div>
          </div>
          {execution.status === "error" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded-full">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                Execução com Erro
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <ExecutionStepper steps={steps} />
        <TerminalLog logs={logs} errorDetails={errorDetails} />
      </div>

      {/* Footer with action buttons */}
      <footer className="p-6 border-t border-border bg-card/50">
        <ActionButtons
          onViewScreenshot={onViewScreenshot}
          onForceStop={onForceStop}
          hasScreenshot={!!errorDetails?.screenshot}
        />
      </footer>
    </div>
  )
}
