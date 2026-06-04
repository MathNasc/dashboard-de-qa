"use client"

import { Bot, Calendar, Clock, Layers, Server, Zap } from "lucide-react"
import { ExecutionStepper } from "./execution-stepper"
import { TerminalLog } from "./terminal-log"
import { ActionButtons } from "./action-buttons"
import { FailureAnalysis } from "./failure-analysis"
import { StatusBadge } from "./status-badge"
import type { Execution } from "./data"

interface ExecutionDetailProps {
  execution: Execution
  onViewScreenshot: () => void
  onForceStop: () => void
}

export function ExecutionDetail({
  execution,
  onViewScreenshot,
  onForceStop,
}: ExecutionDetailProps) {
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

      {/* Content */}
      <div className="space-y-5 p-5 sm:p-6">
        <ExecutionStepper steps={execution.steps} />
        {execution.failure && (
          <FailureAnalysis failure={execution.failure} onViewScreenshot={onViewScreenshot} />
        )}
        <TerminalLog logs={execution.logs} executionName={execution.name} />
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
