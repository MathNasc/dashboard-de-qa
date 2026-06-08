"use client"

import { useEffect } from "react"
import {
  LayoutDashboard,
  HeartPulse,
  Radio,
  BarChart3,
  Bell,
  Bot,
  Server,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { executions } from "./data"

export type DashboardView = "overview" | "health" | "noc" | "analytics" | "alerts"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (view: DashboardView) => void
  onSelectExecution: (id: string) => void
}

const views: { id: DashboardView; label: string; icon: typeof LayoutDashboard; hint: string }[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard, hint: "Investigação de execução" },
  { id: "health", label: "Saúde Operacional", icon: HeartPulse, hint: "SLA, incidentes e frota" },
  { id: "noc", label: "NOC — Centro de Operações", icon: Radio, hint: "Monitoramento ao vivo" },
  { id: "analytics", label: "Analytics", icon: BarChart3, hint: "Tendências e heatmap" },
  { id: "alerts", label: "Alertas", icon: Bell, hint: "Regras e eventos" },
]

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onSelectExecution,
}: CommandPaletteProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  const robots = Array.from(new Set(executions.map((e) => e.robot)))

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Busca global"
      description="Pule para qualquer visão, execução ou robô"
    >
      <CommandInput placeholder="Buscar execuções, robôs, painéis…" />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Navegação">
          {views.map((v) => {
            const Icon = v.icon
            return (
              <CommandItem
                key={v.id}
                value={`view ${v.label} ${v.hint}`}
                onSelect={() => {
                  onNavigate(v.id)
                  onOpenChange(false)
                }}
              >
                <Icon className="h-4 w-4 text-primary" />
                <span>{v.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{v.hint}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Execuções recentes">
          {executions.slice(0, 8).map((e) => (
            <CommandItem
              key={e.id}
              value={`exec ${e.name} ${e.robot} ${e.category}`}
              onSelect={() => {
                onSelectExecution(e.id)
                onNavigate("overview")
                onOpenChange(false)
              }}
            >
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{e.name}</span>
              <span className="ml-auto truncate text-xs text-muted-foreground">
                {e.robot} · {e.timestamp}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Robôs">
          {robots.map((r) => (
            <CommandItem
              key={r}
              value={`robot ${r}`}
              onSelect={() => {
                const first = executions.find((e) => e.robot === r)
                if (first) onSelectExecution(first.id)
                onNavigate("health")
                onOpenChange(false)
              }}
            >
              <Server className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{r}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
