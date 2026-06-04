"use client"

import { useMemo, useState } from "react"
import {
  Search,
  Clock,
  Webhook,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  X,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { StatusIcon } from "./status-badge"
import { statusLabels, type Execution, type ExecutionStatus } from "./data"

// Re-export for backwards compatibility with existing imports.
export type { Execution } from "./data"

type FilterKey = "all" | ExecutionStatus

interface ExecutionSidebarProps {
  executions: Execution[]
  selectedId: string
  onSelect: (id: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const filterOrder: ExecutionStatus[] = ["running", "error", "success"]

export function ExecutionSidebar({
  executions,
  selectedId,
  onSelect,
  collapsed,
  onToggleCollapse,
}: ExecutionSidebarProps) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterKey>("all")

  const counts = useMemo(() => {
    return executions.reduce(
      (acc, e) => {
        acc[e.status] = (acc[e.status] ?? 0) + 1
        return acc
      },
      { success: 0, error: 0, running: 0, queued: 0 } as Record<ExecutionStatus, number>,
    )
  }, [executions])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return executions.filter((e) => {
      const matchesFilter = filter === "all" || e.status === filter
      const matchesQuery =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.robot.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [executions, query, filter])

  const groups = useMemo(() => {
    return filterOrder
      .map((status) => ({
        status,
        items: filtered.filter((e) => e.status === status),
      }))
      .filter((g) => g.items.length > 0)
  }, [filtered])

  if (collapsed) {
    return (
      <aside className="flex h-full w-16 shrink-0 flex-col items-center border-r border-sidebar-border bg-sidebar py-3">
        <button
          onClick={onToggleCollapse}
          aria-label="Expandir menu"
          className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <PanelLeftOpen className="h-4.5 w-4.5" />
        </button>
        <div className="flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto scrollbar-thin">
          {filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => onSelect(e.id)}
              title={`${e.name} — ${statusLabels[e.status]}`}
              aria-label={e.name}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent",
                selectedId === e.id && "bg-sidebar-accent ring-1 ring-primary/40",
              )}
            >
              <StatusIcon status={e.status} size="sm" />
            </button>
          ))}
        </div>
        <Link
          href="/webhook"
          aria-label="Integração de Webhook"
          className="mt-2 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <Webhook className="h-4.5 w-4.5" />
        </Link>
      </aside>
    )
  }

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <Activity className="h-4.5 w-4.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">AutoOps</p>
          <p className="truncate text-[11px] text-muted-foreground">Observabilidade de Automações</p>
        </div>
        <button
          onClick={onToggleCollapse}
          aria-label="Recolher menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <PanelLeftClose className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar execução, robô..."
            className="h-9 w-full rounded-lg border border-sidebar-border bg-secondary pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-2.5">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="Todas"
          count={executions.length}
        />
        {filterOrder.map((status) => (
          <FilterChip
            key={status}
            active={filter === status}
            onClick={() => setFilter(status)}
            label={statusLabels[status]}
            count={counts[status]}
            status={status}
          />
        ))}
      </div>

      {/* List grouped by status */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-3">
        {groups.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            Nenhuma execução encontrada
          </p>
        )}
        {groups.map((group) => (
          <div key={group.status} className="mb-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {statusLabels[group.status]}
              </span>
              <span className="rounded-full bg-secondary px-1.5 text-[11px] font-medium text-muted-foreground">
                {group.items.length}
              </span>
            </div>
            <div className="space-y-1">
              {group.items.map((execution) => (
                <button
                  key={execution.id}
                  onClick={() => onSelect(execution.id)}
                  className={cn(
                    "group relative w-full rounded-lg px-2.5 py-2.5 text-left transition-colors",
                    "hover:bg-sidebar-accent",
                    selectedId === execution.id && "bg-sidebar-accent",
                  )}
                >
                  {selectedId === execution.id && (
                    <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />
                  )}
                  <div className="flex items-start gap-2.5">
                    <StatusIcon status={execution.status} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-sidebar-foreground">
                        {execution.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="truncate font-mono">{execution.robot}</span>
                        <span className="text-border">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {execution.duration}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                        {execution.timestamp}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/webhook"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Webhook className="h-4 w-4" />
          Integração de Webhook
        </Link>
      </div>
    </aside>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  status,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  status?: ExecutionStatus
}) {
  const dot =
    status === "success"
      ? "bg-success"
      : status === "error"
        ? "bg-destructive"
        : status === "running"
          ? "bg-primary"
          : "bg-muted-foreground"
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-sidebar-border bg-secondary text-muted-foreground hover:text-foreground",
      )}
    >
      {status && <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />}
      {label}
      <span className={cn("tabular-nums", active ? "text-primary" : "text-muted-foreground/70")}>
        {count}
      </span>
    </button>
  )
}
