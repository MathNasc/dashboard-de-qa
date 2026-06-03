"use client"

import { Check, X, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Step {
  id: string
  name: string
  status: "completed" | "error" | "pending" | "current"
}

interface ExecutionStepperProps {
  steps: Step[]
}

export function ExecutionStepper({ steps }: ExecutionStepperProps) {
  return (
    <div className="w-full bg-card border border-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
        Linha do Tempo da Execução
      </h3>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <StepIcon status={step.status} />
              <span
                className={cn(
                  "text-xs font-medium mt-2 text-center max-w-24",
                  step.status === "error" && "text-destructive",
                  step.status === "completed" && "text-success",
                  step.status === "current" && "text-primary",
                  step.status === "pending" && "text-muted-foreground"
                )}
              >
                {step.name}
              </span>
              {step.status === "error" && (
                <span className="text-[10px] text-destructive mt-1 font-mono">
                  FALHA
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  step.status === "completed" ? "bg-success" : "bg-border",
                  step.status === "error" && "bg-destructive"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StepIcon({ status }: { status: Step["status"] }) {
  if (status === "completed") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 border-2 border-success">
        <Check className="h-5 w-5 text-success" />
      </div>
    )
  }
  if (status === "error") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20 border-2 border-destructive animate-pulse">
        <X className="h-5 w-5 text-destructive" />
      </div>
    )
  }
  if (status === "current") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 border-2 border-primary">
        <Circle className="h-5 w-5 text-primary animate-pulse" />
      </div>
    )
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border-2 border-border">
      <Circle className="h-5 w-5 text-muted-foreground" />
    </div>
  )
}
