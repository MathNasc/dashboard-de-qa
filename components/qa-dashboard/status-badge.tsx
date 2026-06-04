"use client"

import { Check, X, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { statusLabels, type ExecutionStatus } from "./data"

const styles: Record<
  ExecutionStatus,
  { dot: string; text: string; bg: string; ring: string }
> = {
  success: {
    dot: "bg-success",
    text: "text-success",
    bg: "bg-success/10",
    ring: "ring-success/30",
  },
  error: {
    dot: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
    ring: "ring-destructive/30",
  },
  running: {
    dot: "bg-primary",
    text: "text-primary",
    bg: "bg-primary/10",
    ring: "ring-primary/30",
  },
  queued: {
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    bg: "bg-muted",
    ring: "ring-border",
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: ExecutionStatus
  className?: string
}) {
  const s = styles[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        s.bg,
        s.text,
        s.ring,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "running" && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              s.dot,
            )}
          />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", s.dot)} />
      </span>
      {statusLabels[status]}
    </span>
  )
}

export function StatusIcon({
  status,
  size = "md",
  className,
}: {
  status: ExecutionStatus
  size?: "sm" | "md"
  className?: string
}) {
  const box = size === "sm" ? "h-6 w-6" : "h-8 w-8"
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
  const s = styles[status]

  const Glyph =
    status === "success"
      ? Check
      : status === "error"
        ? X
        : status === "running"
          ? Loader2
          : Clock

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg ring-1",
        box,
        s.bg,
        s.ring,
        className,
      )}
    >
      <Glyph
        className={cn(
          icon,
          s.text,
          status === "running" && "animate-spin",
        )}
      />
    </div>
  )
}
