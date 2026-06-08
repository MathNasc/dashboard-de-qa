"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceDot,
  XAxis,
  YAxis,
} from "recharts"
import {
  TrendingUp,
  Timer,
  PieChart as PieIcon,
  Bot,
  Clock,
  Activity,
  CalendarRange,
  Filter,
  Sparkles,
  Flame,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import {
  anomalies,
  avgDurationSeries,
  failureHeatmap,
  failuresByCategory,
  heatmapHourLabels,
  last24h,
  reliabilitySeries,
  robotsByVolume,
  successRateSeries,
  throughputComparison,
} from "./data"

const successConfig = {
  taxa: { label: "Taxa de Sucesso (%)", color: "var(--color-chart-2)" },
} satisfies ChartConfig

const durationConfig = {
  segundos: { label: "Tempo Médio (s)", color: "var(--color-chart-1)" },
} satisfies ChartConfig

const categoryConfig = {
  total: { label: "Falhas" },
} satisfies ChartConfig

const robotsConfig = {
  execucoes: { label: "Execuções", color: "var(--color-chart-1)" },
} satisfies ChartConfig

const last24hConfig = {
  sucesso: { label: "Sucesso", color: "var(--color-chart-2)" },
  falha: { label: "Falha", color: "var(--color-destructive)" },
} satisfies ChartConfig

const reliabilityConfig = {
  mttr: { label: "MTTR (min)", color: "var(--color-chart-4)" },
  mttd: { label: "MTTD (min)", color: "var(--color-chart-3)" },
} satisfies ChartConfig

const throughputConfig = {
  atual: { label: "Esta semana", color: "var(--color-chart-1)" },
  anterior: { label: "Semana anterior", color: "var(--color-muted-foreground)" },
} satisfies ChartConfig

type Range = "24h" | "7d" | "30d"
type Env = "todos" | "Produção" | "Homologação"

function Panel({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
  action,
}: {
  title: string
  subtitle: string
  icon: typeof TrendingUp
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function Stat({
  label,
  value,
  delta,
  goodDown = false,
  hint,
}: {
  label: string
  value: string
  delta: number
  goodDown?: boolean
  hint: string
}) {
  const isUp = delta > 0
  const isGood = goodDown ? !isUp : isUp
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold text-foreground">{value}</p>
      <div className="mt-1 flex items-center gap-1 text-[11px]">
        <Arrow className={cn("h-3 w-3", isGood ? "text-success" : "text-destructive")} />
        <span className={cn("font-medium", isGood ? "text-success" : "text-destructive")}>
          {isUp ? "+" : ""}
          {delta}%
        </span>
        <span className="text-muted-foreground">{hint}</span>
      </div>
    </div>
  )
}

export function Analytics() {
  const [range, setRange] = useState<Range>("7d")
  const [env, setEnv] = useState<Env>("todos")

  const heatMax = useMemo(
    () => Math.max(...failureHeatmap.flatMap((d) => d.buckets)),
    [],
  )

  const successData = useMemo(
    () =>
      successRateSeries.map((d) => ({
        ...d,
        anomaly: anomalies.find((a) => a.day === d.day) ? d.taxa : null,
      })),
    [],
  )

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span>Filtros</span>
          <span className="mx-2 h-4 w-px bg-border" />
          <CalendarRange className="h-3.5 w-3.5" />
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-0.5">
            <Toggle active={range === "24h"} onClick={() => setRange("24h")}>24h</Toggle>
            <Toggle active={range === "7d"} onClick={() => setRange("7d")}>7d</Toggle>
            <Toggle active={range === "30d"} onClick={() => setRange("30d")}>30d</Toggle>
          </div>
          <span className="mx-2 h-4 w-px bg-border" />
          <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-0.5">
            <Toggle active={env === "todos"} onClick={() => setEnv("todos")}>Todos ambientes</Toggle>
            <Toggle active={env === "Produção"} onClick={() => setEnv("Produção")}>Produção</Toggle>
            <Toggle active={env === "Homologação"} onClick={() => setEnv("Homologação")}>Homolog.</Toggle>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          Detecção de anomalias ativa
        </div>
      </div>

      {/* Reliability summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="MTTR" value="17 min" delta={-19} goodDown hint="vs. semana" />
        <Stat label="MTTD" value="4 min" delta={-20} goodDown hint="vs. semana" />
        <Stat label="Error Budget" value="38%" delta={-12} hint="restante no mês" />
        <Stat label="Throughput" value="950" delta={9.4} hint="execuções/semana" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Taxa de Sucesso por Período"
          subtitle="Últimos 7 dias com anomalias detectadas"
          icon={TrendingUp}
          action={
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
              Anomalia
            </div>
          }
        >
          <ChartContainer config={successConfig} className="h-56 w-full">
            <AreaChart data={successData} margin={{ left: -16, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fillTaxa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <YAxis domain={[60, 100]} tickLine={false} axisLine={false} fontSize={11} width={32} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="taxa"
                type="monotone"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                fill="url(#fillTaxa)"
              />
              {anomalies.map((a) => {
                const point = successRateSeries.find((d) => d.day === a.day)
                if (!point) return null
                return (
                  <ReferenceDot
                    key={a.day}
                    x={a.day}
                    y={point.taxa}
                    r={5}
                    fill={a.type === "drop" ? "var(--color-destructive)" : "var(--color-chart-2)"}
                    stroke="var(--color-card)"
                    strokeWidth={2}
                  />
                )
              })}
            </AreaChart>
          </ChartContainer>
          <ul className="mt-3 space-y-1.5 text-[11px]">
            {anomalies.map((a) => (
              <li key={a.day} className="flex items-start gap-2 text-muted-foreground">
                <span
                  className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    a.type === "drop" ? "bg-destructive" : "bg-success",
                  )}
                />
                <span>
                  <span className="font-mono text-foreground">{a.day}</span> · {a.note}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="MTTR / MTTD" subtitle="Tempo médio de detecção e resolução (min)" icon={Activity}>
          <ChartContainer config={reliabilityConfig} className="h-56 w-full">
            <LineChart data={reliabilitySeries} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="mttr"
                type="monotone"
                stroke="var(--color-chart-4)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-chart-4)" }}
              />
              <Line
                dataKey="mttd"
                type="monotone"
                stroke="var(--color-chart-3)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-chart-3)" }}
              />
            </LineChart>
          </ChartContainer>
        </Panel>

        <Panel title="Tempo Médio de Execução" subtitle="Últimos 7 dias (segundos)" icon={Timer}>
          <ChartContainer config={durationConfig} className="h-56 w-full">
            <LineChart data={avgDurationSeries} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="segundos"
                type="monotone"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-chart-1)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </Panel>

        <Panel title="Throughput Comparativo" subtitle="Esta semana vs. anterior" icon={TrendingUp}>
          <ChartContainer config={throughputConfig} className="h-56 w-full">
            <BarChart data={throughputComparison} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="anterior" fill="var(--color-muted-foreground)" radius={[2, 2, 0, 0]} barSize={10} fillOpacity={0.35} />
              <Bar dataKey="atual" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} barSize={10} />
            </BarChart>
          </ChartContainer>
        </Panel>

        <Panel title="Falhas por Categoria" subtitle="Distribuição no período" icon={PieIcon}>
          <div className="flex items-center gap-4">
            <ChartContainer config={categoryConfig} className="h-56 w-full max-w-[55%]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="categoria" />} />
                <Pie
                  data={failuresByCategory}
                  dataKey="total"
                  nameKey="categoria"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="var(--color-card)"
                >
                  {failuresByCategory.map((entry) => (
                    <Cell key={entry.categoria} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="flex-1 space-y-2">
              {failuresByCategory.map((c) => (
                <li key={c.categoria} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.fill }} />
                    {c.categoria}
                  </span>
                  <span className="font-mono font-medium text-foreground">{c.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel title="Robôs com Maior Volume" subtitle="Execuções por robô" icon={Bot}>
          <ChartContainer config={robotsConfig} className="h-56 w-full">
            <BarChart
              data={robotsByVolume}
              layout="vertical"
              margin={{ left: 24, right: 16, top: 4 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis
                type="category"
                dataKey="robo"
                tickLine={false}
                axisLine={false}
                width={88}
                fontSize={11}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="execucoes" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ChartContainer>
        </Panel>

        <Panel
          title="Heatmap de Falhas"
          subtitle="Dia da semana × hora — janelas de 3h"
          icon={Flame}
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="ml-10 mb-1 grid grid-cols-8 gap-1 text-[10px] text-muted-foreground">
                {heatmapHourLabels.map((h) => (
                  <span key={h} className="text-center">{h}</span>
                ))}
              </div>
              <div className="space-y-1">
                {failureHeatmap.map((row) => (
                  <div key={row.day} className="flex items-center gap-1">
                    <span className="w-9 text-[10px] font-medium text-muted-foreground">{row.day}</span>
                    <div className="grid flex-1 grid-cols-8 gap-1">
                      {row.buckets.map((value, idx) => {
                        const intensity = heatMax ? value / heatMax : 0
                        return (
                          <div
                            key={idx}
                            className="group relative h-7 rounded-md border border-border/60"
                            style={{
                              backgroundColor:
                                intensity === 0
                                  ? "color-mix(in oklab, var(--muted) 50%, transparent)"
                                  : `color-mix(in oklab, var(--destructive) ${Math.round(intensity * 80)}%, transparent)`,
                            }}
                          >
                            <div className="pointer-events-none absolute inset-x-0 -top-7 z-10 mx-auto hidden w-max rounded bg-popover px-1.5 py-0.5 text-[10px] text-popover-foreground shadow group-hover:block">
                              {row.day} {heatmapHourLabels[idx]} · {value} falhas
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="ml-10 mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>Menos</span>
                <div className="flex gap-1">
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map((s) => (
                    <span
                      key={s}
                      className="h-3 w-5 rounded"
                      style={{
                        backgroundColor: `color-mix(in oklab, var(--destructive) ${Math.round(s * 80)}%, transparent)`,
                      }}
                    />
                  ))}
                </div>
                <span>Mais falhas</span>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title="Histórico das Últimas 24 Horas"
          subtitle="Execuções por hora (sucesso x falha)"
          icon={Clock}
          className="lg:col-span-2"
        >
          <ChartContainer config={last24hConfig} className="h-60 w-full">
            <BarChart data={last24h} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="hora" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval={1} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sucesso" stackId="a" fill="var(--color-chart-2)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="falha" stackId="a" fill="var(--color-destructive)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Panel>
      </div>
    </div>
  )
}
