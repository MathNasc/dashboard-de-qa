"use client"

import { Bot, Search, Bell, ChevronDown } from "lucide-react"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

interface AppHeaderProps {
  onOpenPalette: () => void
  unreadAlerts: number
}

export function AppHeader({ onOpenPalette, unreadAlerts }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card/40 px-4 py-2 backdrop-blur sm:px-6">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <Bot className="h-4 w-4 text-primary" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-card" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight text-foreground">AutoOps</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Observability Suite
          </p>
        </div>
      </div>

      {/* Global search trigger */}
      <button
        onClick={onOpenPalette}
        aria-label="Abrir busca global (Ctrl K)"
        className="group hidden h-9 min-w-[280px] max-w-md flex-1 items-center gap-2.5 rounded-lg border border-border bg-secondary/60 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary md:flex"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Buscar execuções, robôs, painéis…</span>
        <KbdGroup className="text-muted-foreground">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPalette}
          aria-label="Buscar"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground transition-colors hover:bg-secondary md:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        <button
          aria-label="Notificações"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground transition-colors hover:bg-secondary"
        >
          <Bell className="h-4 w-4" />
          {unreadAlerts > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground ring-2 ring-card">
              {unreadAlerts}
            </span>
          )}
        </button>

        <button className="flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-2 py-1 text-left transition-colors hover:bg-secondary">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-info text-[11px] font-semibold text-primary-foreground">
            MN
          </span>
          <div className="hidden text-xs leading-tight sm:block">
            <p className="font-medium text-foreground">Matheus N.</p>
            <p className="text-[10px] text-muted-foreground">Squad Fiscal</p>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
        </button>
      </div>
    </header>
  )
}
