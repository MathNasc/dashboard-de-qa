"use client"

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
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp, Timer, PieChart as PieIcon, Bot, Clock } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  avgDurationSeries,
  failuresByCategory,
  last24h,
  robotsByVolume,
  successRateSeries,
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

function Panel({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
}: {
  title: string
  subtitle: string
  icon: typeof TrendingUp
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className ?? ""}`}>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export function Analytics() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel
        title="Taxa de Sucesso por Período"
        subtitle="Últimos 7 dias"
        icon={TrendingUp}
      >
        <ChartContainer config={successConfig} className="h-56 w-full">
          <AreaChart data={successRateSeries} margin={{ left: -16, right: 8, top: 8 }}>
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
          </AreaChart>
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
  )
}
