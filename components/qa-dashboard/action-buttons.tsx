"use client"

import { Camera, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionButtonsProps {
  onViewScreenshot: () => void
  onForceStop: () => void
  hasScreenshot?: boolean
}

export function ActionButtons({
  onViewScreenshot,
  onForceStop,
  hasScreenshot = true,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="outline"
        onClick={onViewScreenshot}
        disabled={!hasScreenshot}
        className="gap-2"
      >
        <Camera className="h-4 w-4" />
        Visualizar Captura de Tela do Erro
      </Button>
      <Button
        variant="destructive"
        onClick={onForceStop}
        className="gap-2"
      >
        <StopCircle className="h-4 w-4" />
        Forçar Parada
      </Button>
    </div>
  )
}
