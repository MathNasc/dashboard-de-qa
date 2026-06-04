"use client"

import { Camera, StopCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionButtonsProps {
  onViewScreenshot: () => void
  onForceStop: () => void
  hasScreenshot?: boolean
  isRunning?: boolean
}

export function ActionButtons({
  onViewScreenshot,
  onForceStop,
  hasScreenshot = true,
  isRunning = false,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
        <RefreshCw className="h-4 w-4" />
        Reexecutar
      </Button>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onViewScreenshot}
          disabled={!hasScreenshot}
          className="gap-2"
        >
          <Camera className="h-4 w-4" />
          Visualizar Captura de Tela
        </Button>
        <Button
          variant="destructive"
          onClick={onForceStop}
          disabled={!isRunning}
          className="gap-2"
        >
          <StopCircle className="h-4 w-4" />
          Forçar Parada
        </Button>
      </div>
    </div>
  )
}
