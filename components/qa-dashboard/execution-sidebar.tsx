"use client"

import { Check, X, Clock, Play, Webhook } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export interface Execution {
  id: string
  name: string
  duration: string
  status: "success" | "error" | "running"
  timestamp: string
}

interface ExecutionSidebarProps {
  executions: Execution[]
  selectedId: string
  onSelect: (id: string) => void
}

export function ExecutionSidebar({ executions, selectedId, onSelect }: ExecutionSidebarProps) {
  return (
    <aside className="w-80 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold text-sidebar-foreground uppercase tracking-wider">
          Execuções Recentes
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {executions.map((execution) => (
          <button
            key={execution.id}
            onClick={() => onSelect(execution.id)}
            className={cn(
              "w-full p-4 text-left border-b border-sidebar-border transition-colors",
              "hover:bg-sidebar-accent",
              selectedId === execution.id && "bg-sidebar-accent"
            )}
          >
            <div className="flex items-start gap-3">
              <StatusIcon status={execution.status} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {execution.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {execution.duration}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {execution.timestamp}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <Link
          href="/webhook"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-sidebar-foreground transition-colors"
        >
          <Webhook className="h-4 w-4" />
          Integração de Webhook
        </Link>
      </div>
    </aside>
  )
}

function StatusIcon({ status }: { status: Execution["status"] }) {
  if (status === "success") {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20">
        <Check className="h-3.5 w-3.5 text-success" />
      </div>
    )
  }
  if (status === "error") {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20">
        <X className="h-3.5 w-3.5 text-destructive" />
      </div>
    )
  }
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
      <Play className="h-3.5 w-3.5 text-primary animate-pulse" />
    </div>
  )
}
