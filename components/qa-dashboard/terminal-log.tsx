"use client"

import { Terminal, AlertTriangle } from "lucide-react"

interface TerminalLogProps {
  logs: string[]
  errorDetails?: {
    selector: string
    screenshot?: string
  }
}

export function TerminalLog({ logs, errorDetails }: TerminalLogProps) {
  return (
    <div className="w-full bg-terminal border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 bg-card border-b border-border">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-card-foreground">
          Log de Execução
        </span>
        <div className="flex gap-1.5 ml-auto">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
      </div>
      <div className="p-4 font-mono text-sm overflow-y-auto max-h-80 min-h-64">
        {logs.map((log, index) => (
          <div key={index} className="flex gap-2">
            <span className="text-muted-foreground select-none">
              {String(index + 1).padStart(3, "0")}
            </span>
            <span
              className={
                log.includes("ERROR") || log.includes("ERRO")
                  ? "text-destructive"
                  : log.includes("WARN") || log.includes("AVISO")
                    ? "text-warning"
                    : log.includes("SUCCESS") || log.includes("OK")
                      ? "text-success"
                      : "text-terminal-foreground"
              }
            >
              {log}
            </span>
          </div>
        ))}
        {errorDetails && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold">Detalhes do Erro</span>
            </div>
            <p className="text-destructive/90 text-xs">
              Seletor UI Nativo não encontrado:
            </p>
            <code className="block mt-1 text-xs text-destructive bg-destructive/5 p-2 rounded">
              {errorDetails.selector}
            </code>
          </div>
        )}
      </div>
    </div>
  )
}
