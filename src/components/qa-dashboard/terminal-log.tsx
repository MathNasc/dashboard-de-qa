"use client"

import { useMemo, useState } from "react"
import { Terminal, Search, Copy, Check, Download, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LogEntry, LogLevel } from "./data"

interface TerminalLogProps {
  logs: LogEntry[]
  executionName: string
}

const levelStyles: Record<LogLevel, { text: string; badge: string; label: string }> = {
  INFO: { text: "text-info", badge: "bg-info/15 text-info", label: "INFO" },
  WARN: { text: "text-warning", badge: "bg-warning/15 text-warning", label: "WARN" },
  ERROR: { text: "text-destructive", badge: "bg-destructive/15 text-destructive", label: "ERROR" },
  SUCCESS: { text: "text-success", badge: "bg-success/15 text-success", label: "SUCCESS" },
  DEBUG: { text: "text-muted-foreground", badge: "bg-muted text-muted-foreground", label: "DEBUG" },
}

const filterLevels: LogLevel[] = ["INFO", "SUCCESS", "WARN", "ERROR"]

export function TerminalLog({ logs, executionName }: TerminalLogProps) {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState<Set<LogLevel>>(new Set())
  const [copied, setCopied] = useState(false)

  const counts = useMemo(() => {
    return logs.reduce(
      (acc, l) => {
        acc[l.level] = (acc[l.level] ?? 0) + 1
        return acc
      },
      {} as Record<LogLevel, number>,
    )
  }, [logs])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return logs.filter((l) => {
      const matchesLevel = active.size === 0 || active.has(l.level)
      const matchesQuery = !q || l.message.toLowerCase().includes(q) || l.time.includes(q)
      return matchesLevel && matchesQuery
    })
  }, [logs, query, active])

  const toLine = (l: LogEntry) => `[${l.time}] ${l.level}: ${l.message}`

  const toggleLevel = (level: LogLevel) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  const copyLogs = async () => {
    try {
      await navigator.clipboard.writeText(filtered.map(toLine).join("\n"))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  const exportLogs = () => {
    const blob = new Blob([filtered.map(toLine).join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${executionName.toLowerCase().replace(/\s+/g, "-")}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-terminal">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-card-foreground">Log de Execução</span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Severity filters */}
          <div className="flex items-center gap-1">
            {filterLevels.map((level) => (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={cn(
                  "rounded-md px-2 py-1 font-mono text-[11px] font-medium transition-colors",
                  active.has(level)
                    ? levelStyles[level].badge
                    : "text-muted-foreground hover:bg-secondary",
                )}
                title={`Filtrar ${level}`}
              >
                {level}
                <span className="ml-1 opacity-70">{counts[level] ?? 0}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nos logs..."
              className="h-8 w-44 rounded-md border border-border bg-secondary pl-8 pr-7 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Limpar"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <button
            onClick={copyLogs}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            title="Copiar logs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <button
            onClick={exportLogs}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            title="Exportar logs"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Lines */}
      <div className="max-h-96 min-h-64 overflow-y-auto scrollbar-thin p-3 font-mono text-[13px] leading-relaxed">
        {filtered.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            Nenhuma linha corresponde aos filtros.
          </p>
        ) : (
          filtered.map((log, index) => {
            const s = levelStyles[log.level]
            return (
              <div
                key={index}
                className="group flex items-start gap-3 rounded px-2 py-0.5 hover:bg-white/[0.03]"
              >
                <span className="w-8 shrink-0 select-none text-right text-muted-foreground/50">
                  {String(index + 1).padStart(3, "0")}
                </span>
                <span className="shrink-0 select-none text-muted-foreground/70">{log.time}</span>
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 text-[10px] font-semibold leading-5",
                    s.badge,
                  )}
                >
                  {s.label}
                </span>
                <span className={cn("min-w-0 break-words", s.text)}>{log.message}</span>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
