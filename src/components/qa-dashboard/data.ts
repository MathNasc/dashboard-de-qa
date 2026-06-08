// Centralized domain types, mock data and helpers for the AutoOps platform.

export type ExecutionStatus = "success" | "error" | "running" | "queued"

export type StepStatus =
  | "completed"
  | "error"
  | "pending"
  | "running"
  | "skipped"

export type LogLevel = "INFO" | "WARN" | "ERROR" | "SUCCESS" | "DEBUG"

export interface LogEntry {
  time: string
  level: LogLevel
  message: string
}

export interface Step {
  id: string
  name: string
  status: StepStatus
  startedAt?: string
  finishedAt?: string
  duration?: string
}

export interface FailureAnalysis {
  summary: string
  category: string
  impact: "Crítico" | "Alto" | "Médio" | "Baixo"
  rootCause: string
  selector?: string
  screenshot?: string
  suggestions: string[]
}

export interface Execution {
  id: string
  name: string
  robot: string
  category: string
  environment: string
  trigger: string
  duration: string
  durationMs: number
  status: ExecutionStatus
  timestamp: string
  startedAt: string
  finishedAt: string
  steps: Step[]
  logs: LogEntry[]
  failure?: FailureAnalysis
}

export interface Kpi {
  id: string
  label: string
  value: string
  /** Percentage variation vs. previous period. Positive = up. */
  delta: number
  /** Whether an upward delta is good (green) or bad (red). */
  positiveIsGood: boolean
  hint: string
  tone: "primary" | "success" | "warning" | "error" | "info"
  spark: number[]
}

export const executions: Execution[] = [
  {
    id: "1",
    name: "Fluxo Venda Faturada",
    robot: "RPA-SAP-01",
    category: "Fiscal",
    environment: "Produção",
    trigger: "Agendado",
    duration: "2m 34s",
    durationMs: 154000,
    status: "error",
    timestamp: "02/06/2026 14:32:15",
    startedAt: "14:32:15",
    finishedAt: "14:34:03",
    steps: [
      { id: "1", name: "Acesso Caixa", status: "completed", startedAt: "14:32:15", finishedAt: "14:32:25", duration: "10s" },
      { id: "2", name: "Gerenciamento Fiscal", status: "error", startedAt: "14:32:30", finishedAt: "14:34:00", duration: "1m 30s" },
      { id: "3", name: "Emissão NF", status: "pending" },
      { id: "4", name: "CmdQuit", status: "pending" },
    ],
    logs: [
      { time: "14:32:15", level: "INFO", message: "Iniciando execução do fluxo Venda Faturada" },
      { time: "14:32:16", level: "INFO", message: "Conectando ao sistema SAP..." },
      { time: "14:32:18", level: "SUCCESS", message: "Conexão estabelecida com sucesso" },
      { time: "14:32:19", level: "INFO", message: "Navegando para módulo Acesso Caixa" },
      { time: "14:32:25", level: "SUCCESS", message: "Módulo Acesso Caixa carregado" },
      { time: "14:32:26", level: "INFO", message: "Executando validações de sessão..." },
      { time: "14:32:28", level: "SUCCESS", message: "Sessão validada com sucesso" },
      { time: "14:32:30", level: "INFO", message: "Navegando para Gerenciamento Fiscal" },
      { time: "14:32:45", level: "WARN", message: "Tempo de carregamento acima do esperado" },
      { time: "14:33:00", level: "INFO", message: "Tentando localizar elemento de interface..." },
      { time: "14:33:15", level: "WARN", message: "Elemento não encontrado, tentativa 1/3" },
      { time: "14:33:30", level: "WARN", message: "Elemento não encontrado, tentativa 2/3" },
      { time: "14:33:45", level: "WARN", message: "Elemento não encontrado, tentativa 3/3" },
      { time: "14:34:00", level: "ERROR", message: "Falha ao localizar seletor UI nativo" },
      { time: "14:34:01", level: "ERROR", message: "ElementNotFoundException: O robô não conseguiu encontrar o seletor UI nativo especificado" },
      { time: "14:34:02", level: "INFO", message: "Captura de tela salva em /logs/screenshots/error_20260602_143402.png" },
      { time: "14:34:03", level: "INFO", message: "Execução pausada - aguardando intervenção manual" },
    ],
    failure: {
      summary:
        "O robô não conseguiu localizar o seletor de interface nativo no módulo Gerenciamento Fiscal após 3 tentativas.",
      category: "Seletor de UI",
      impact: "Alto",
      rootCause:
        "O elemento de grid do SAP alterou sua hierarquia (rowcol) ou a tela demorou além do timeout para renderizar, invalidando o seletor mapeado.",
      selector: "wnd[0]/usr/cntlGRID1/shellcont/shell/rowcol[2,3]",
      screenshot: "/logs/screenshots/error_20260602_143402.png",
      suggestions: [
        "Aumentar o timeout de espera do elemento no Gerenciamento Fiscal.",
        "Adicionar fallback por seletor de imagem quando o seletor nativo falhar.",
        "Revisar o mapeamento do grid (rowcol) após atualização do SAP.",
      ],
    },
  },
  {
    id: "2",
    name: "Saída de Mercadorias",
    robot: "RPA-WMS-02",
    category: "Logística",
    environment: "Produção",
    trigger: "Webhook",
    duration: "1m 12s",
    durationMs: 72000,
    status: "success",
    timestamp: "02/06/2026 14:28:03",
    startedAt: "14:28:03",
    finishedAt: "14:29:15",
    steps: [
      { id: "1", name: "Login Sistema", status: "completed", startedAt: "14:28:03", finishedAt: "14:28:10", duration: "7s" },
      { id: "2", name: "Consulta Estoque", status: "completed", startedAt: "14:28:10", finishedAt: "14:28:25", duration: "15s" },
      { id: "3", name: "Separação", status: "completed", startedAt: "14:28:25", finishedAt: "14:28:45", duration: "20s" },
      { id: "4", name: "Expedição", status: "completed", startedAt: "14:28:45", finishedAt: "14:29:15", duration: "30s" },
    ],
    logs: [
      { time: "14:28:03", level: "INFO", message: "Iniciando execução do fluxo Saída de Mercadorias" },
      { time: "14:28:05", level: "SUCCESS", message: "Conexão estabelecida" },
      { time: "14:28:10", level: "SUCCESS", message: "Login realizado com sucesso" },
      { time: "14:28:15", level: "INFO", message: "Consultando estoque disponível..." },
      { time: "14:28:25", level: "SUCCESS", message: "Estoque validado" },
      { time: "14:28:45", level: "SUCCESS", message: "Separação concluída" },
      { time: "14:29:10", level: "SUCCESS", message: "Expedição finalizada com sucesso" },
      { time: "14:29:15", level: "INFO", message: "Fluxo concluído sem erros" },
    ],
  },
  {
    id: "3",
    name: "Entrada de Notas",
    robot: "RPA-SAP-01",
    category: "Fiscal",
    environment: "Produção",
    trigger: "Agendado",
    duration: "3m 45s",
    durationMs: 225000,
    status: "success",
    timestamp: "02/06/2026 14:15:22",
    startedAt: "14:15:22",
    finishedAt: "14:19:07",
    steps: [
      { id: "1", name: "Início", status: "completed", startedAt: "14:15:22", finishedAt: "14:15:40", duration: "18s" },
      { id: "2", name: "Leitura XML", status: "completed", startedAt: "14:15:40", finishedAt: "14:17:10", duration: "1m 30s" },
      { id: "3", name: "Validação", status: "completed", startedAt: "14:17:10", finishedAt: "14:18:30", duration: "1m 20s" },
      { id: "4", name: "Lançamento", status: "completed", startedAt: "14:18:30", finishedAt: "14:19:07", duration: "37s" },
    ],
    logs: [
      { time: "14:15:22", level: "INFO", message: "Iniciando execução do fluxo Entrada de Notas" },
      { time: "14:15:40", level: "SUCCESS", message: "Conexão estabelecida com o SAP" },
      { time: "14:17:10", level: "SUCCESS", message: "XML das notas lido e parseado (42 itens)" },
      { time: "14:18:30", level: "SUCCESS", message: "Validação fiscal concluída" },
      { time: "14:19:07", level: "SUCCESS", message: "Notas lançadas com sucesso" },
    ],
  },
  {
    id: "4",
    name: "Cadastro de Produtos",
    robot: "RPA-ERP-03",
    category: "Cadastro",
    environment: "Homologação",
    trigger: "Manual",
    duration: "0m 58s",
    durationMs: 58000,
    status: "success",
    timestamp: "02/06/2026 14:10:11",
    startedAt: "14:10:11",
    finishedAt: "14:11:09",
    steps: [
      { id: "1", name: "Login", status: "completed", startedAt: "14:10:11", finishedAt: "14:10:20", duration: "9s" },
      { id: "2", name: "Importar Planilha", status: "completed", startedAt: "14:10:20", finishedAt: "14:10:45", duration: "25s" },
      { id: "3", name: "Gravar Cadastros", status: "completed", startedAt: "14:10:45", finishedAt: "14:11:09", duration: "24s" },
    ],
    logs: [
      { time: "14:10:11", level: "INFO", message: "Iniciando cadastro de produtos" },
      { time: "14:10:20", level: "SUCCESS", message: "Login realizado" },
      { time: "14:10:45", level: "SUCCESS", message: "Planilha importada (120 produtos)" },
      { time: "14:11:09", level: "SUCCESS", message: "Cadastros gravados com sucesso" },
    ],
  },
  {
    id: "5",
    name: "Fluxo Devolução",
    robot: "RPA-SAP-01",
    category: "Fiscal",
    environment: "Produção",
    trigger: "Agendado",
    duration: "1m 47s",
    durationMs: 107000,
    status: "error",
    timestamp: "02/06/2026 13:55:48",
    startedAt: "13:55:48",
    finishedAt: "13:57:35",
    steps: [
      { id: "1", name: "Buscar Venda", status: "completed", startedAt: "13:55:48", finishedAt: "13:56:05", duration: "17s" },
      { id: "2", name: "Estornar Itens", status: "error", startedAt: "13:56:05", finishedAt: "13:57:35", duration: "1m 30s" },
      { id: "3", name: "Gerar Nota", status: "pending" },
      { id: "4", name: "Finalizar", status: "pending" },
    ],
    logs: [
      { time: "13:55:48", level: "INFO", message: "Iniciando execução do fluxo Devolução" },
      { time: "13:56:05", level: "SUCCESS", message: "Venda localizada" },
      { time: "13:56:30", level: "WARN", message: "Aba de estorno demorou a responder" },
      { time: "13:57:30", level: "ERROR", message: "Timeout ao estornar itens da venda" },
      { time: "13:57:35", level: "ERROR", message: "TimeoutException: A aba de estorno não respondeu em 60s" },
    ],
    failure: {
      summary:
        "A etapa de estorno de itens excedeu o tempo limite de resposta da interface (60s).",
      category: "Timeout",
      impact: "Médio",
      rootCause:
        "Lentidão no ambiente SAP em horário de pico fez a aba de estorno ultrapassar o timeout configurado.",
      selector: "wnd[0]/usr/tabsTABSTRIP/tabpTAB01/ssubSCREEN:SAPLDEV:0100",
      screenshot: "/logs/screenshots/error_20260602_135548.png",
      suggestions: [
        "Reagendar o fluxo para fora do horário de pico do SAP.",
        "Implementar retry com backoff exponencial na etapa de estorno.",
        "Monitorar latência do SAP e abortar mais cedo com diagnóstico claro.",
      ],
    },
  },
  {
    id: "6",
    name: "Conferência de Estoque",
    robot: "RPA-WMS-02",
    category: "Logística",
    environment: "Produção",
    trigger: "Agendado",
    duration: "4m 22s",
    durationMs: 262000,
    status: "success",
    timestamp: "02/06/2026 13:45:30",
    startedAt: "13:45:30",
    finishedAt: "13:49:52",
    steps: [
      { id: "1", name: "Início", status: "completed", startedAt: "13:45:30", finishedAt: "13:45:50", duration: "20s" },
      { id: "2", name: "Coleta Saldos", status: "completed", startedAt: "13:45:50", finishedAt: "13:47:40", duration: "1m 50s" },
      { id: "3", name: "Comparação", status: "completed", startedAt: "13:47:40", finishedAt: "13:49:10", duration: "1m 30s" },
      { id: "4", name: "Relatório", status: "completed", startedAt: "13:49:10", finishedAt: "13:49:52", duration: "42s" },
    ],
    logs: [
      { time: "13:45:30", level: "INFO", message: "Iniciando conferência de estoque" },
      { time: "13:47:40", level: "SUCCESS", message: "Saldos coletados (1.245 SKUs)" },
      { time: "13:49:10", level: "SUCCESS", message: "Comparação concluída — 3 divergências" },
      { time: "13:49:52", level: "SUCCESS", message: "Relatório gerado com sucesso" },
    ],
  },
  {
    id: "7",
    name: "Sincronização de Preços",
    robot: "RPA-ERP-03",
    category: "Cadastro",
    environment: "Produção",
    trigger: "Webhook",
    duration: "0m 47s",
    durationMs: 47000,
    status: "running",
    timestamp: "02/06/2026 14:33:40",
    startedAt: "14:33:40",
    finishedAt: "—",
    steps: [
      { id: "1", name: "Login", status: "completed", startedAt: "14:33:40", finishedAt: "14:33:48", duration: "8s" },
      { id: "2", name: "Carregar Tabela", status: "completed", startedAt: "14:33:48", finishedAt: "14:34:05", duration: "17s" },
      { id: "3", name: "Atualizar Preços", status: "running", startedAt: "14:34:05" },
      { id: "4", name: "Publicar", status: "pending" },
    ],
    logs: [
      { time: "14:33:40", level: "INFO", message: "Iniciando sincronização de preços" },
      { time: "14:33:48", level: "SUCCESS", message: "Login realizado" },
      { time: "14:34:05", level: "SUCCESS", message: "Tabela de preços carregada (3.210 itens)" },
      { time: "14:34:06", level: "INFO", message: "Atualizando preços em lote..." },
    ],
  },
]

export const statusLabels: Record<ExecutionStatus, string> = {
  success: "Sucesso",
  error: "Falha",
  running: "Em andamento",
  queued: "Na fila",
}

export function getKpis(items: Execution[]): Kpi[] {
  const total = items.length
  const running = items.filter((e) => e.status === "running").length
  const failures = items.filter((e) => e.status === "error").length
  const success = items.filter((e) => e.status === "success").length
  const finished = success + failures
  const successRate = finished ? Math.round((success / finished) * 100) : 0
  const robots = new Set(items.map((e) => e.robot)).size
  const avgMs =
    items.reduce((acc, e) => acc + e.durationMs, 0) / (total || 1)
  const avgMin = Math.floor(avgMs / 60000)
  const avgSec = Math.round((avgMs % 60000) / 1000)

  return [
    {
      id: "today",
      label: "Execuções Hoje",
      value: String(total),
      delta: 12.5,
      positiveIsGood: true,
      hint: "vs. ontem",
      tone: "primary",
      spark: [8, 12, 9, 14, 11, 16, total],
    },
    {
      id: "running",
      label: "Em Andamento",
      value: String(running),
      delta: 0,
      positiveIsGood: true,
      hint: "tempo real",
      tone: "info",
      spark: [0, 1, 0, 2, 1, 1, running],
    },
    {
      id: "success-rate",
      label: "Taxa de Sucesso",
      value: `${successRate}%`,
      delta: 4.2,
      positiveIsGood: true,
      hint: "vs. semana",
      tone: "success",
      spark: [78, 82, 80, 85, 83, 88, successRate],
    },
    {
      id: "failures",
      label: "Total de Falhas",
      value: String(failures),
      delta: -8.3,
      positiveIsGood: false,
      hint: "vs. ontem",
      tone: "error",
      spark: [4, 3, 5, 2, 3, 2, failures],
    },
    {
      id: "avg",
      label: "Tempo Médio",
      value: `${avgMin}m ${avgSec.toString().padStart(2, "0")}s`,
      delta: -3.1,
      positiveIsGood: false,
      hint: "por execução",
      tone: "warning",
      spark: [150, 140, 160, 135, 145, 138, Math.round(avgMs / 1000)],
    },
    {
      id: "robots",
      label: "Robôs Ativos",
      value: String(robots),
      delta: 0,
      positiveIsGood: true,
      hint: "online agora",
      tone: "primary",
      spark: [3, 3, 3, 3, 3, 3, robots],
    },
  ]
}

// ---- Analytics datasets (Grafana-like) ----

export const successRateSeries = [
  { day: "27/05", taxa: 82, falhas: 6 },
  { day: "28/05", taxa: 88, falhas: 4 },
  { day: "29/05", taxa: 79, falhas: 8 },
  { day: "30/05", taxa: 91, falhas: 3 },
  { day: "31/05", taxa: 86, falhas: 5 },
  { day: "01/06", taxa: 93, falhas: 2 },
  { day: "02/06", taxa: 90, falhas: 3 },
]

export const avgDurationSeries = [
  { day: "27/05", segundos: 168 },
  { day: "28/05", segundos: 152 },
  { day: "29/05", segundos: 181 },
  { day: "30/05", segundos: 144 },
  { day: "31/05", segundos: 159 },
  { day: "01/06", segundos: 138 },
  { day: "02/06", segundos: 147 },
]

export const failuresByCategory = [
  { categoria: "Seletor de UI", total: 14, fill: "var(--color-chart-1)" },
  { categoria: "Timeout", total: 9, fill: "var(--color-chart-4)" },
  { categoria: "Autenticação", total: 5, fill: "var(--color-chart-3)" },
  { categoria: "Dados", total: 4, fill: "var(--color-chart-5)" },
  { categoria: "Rede", total: 2, fill: "var(--color-chart-2)" },
]

export const robotsByVolume = [
  { robo: "RPA-SAP-01", execucoes: 142 },
  { robo: "RPA-WMS-02", execucoes: 98 },
  { robo: "RPA-ERP-03", execucoes: 76 },
  { robo: "RPA-WEB-04", execucoes: 54 },
  { robo: "RPA-MAIL-05", execucoes: 31 },
]

export const last24h = Array.from({ length: 24 }, (_, h) => {
  const base = 4 + Math.round(Math.sin(h / 3) * 3 + (h > 7 && h < 19 ? 5 : 1))
  const sucesso = Math.max(1, base)
  const falha = Math.max(0, Math.round(Math.cos(h / 4) * 1.5 + (h % 6 === 0 ? 2 : 0)))
  return {
    hora: `${h.toString().padStart(2, "0")}h`,
    sucesso,
    falha,
  }
})

// ---- Operational health datasets ----

export type RobotHealthStatus = "healthy" | "degraded" | "down" | "maintenance"

export interface RobotHealth {
  id: string
  name: string
  squad: string
  status: RobotHealthStatus
  uptimePct: number
  successRate: number
  avgDuration: string
  queueDepth: number
  lastRun: string
  slaTarget: number
  incidents24h: number
}

export const robotsHealth: RobotHealth[] = [
  { id: "RPA-SAP-01", name: "RPA-SAP-01", squad: "Fiscal", status: "degraded", uptimePct: 96.4, successRate: 82, avgDuration: "2m 18s", queueDepth: 4, lastRun: "há 2 min", slaTarget: 95, incidents24h: 3 },
  { id: "RPA-WMS-02", name: "RPA-WMS-02", squad: "Logística", status: "healthy", uptimePct: 99.8, successRate: 97, avgDuration: "1m 42s", queueDepth: 1, lastRun: "há 5 min", slaTarget: 95, incidents24h: 0 },
  { id: "RPA-ERP-03", name: "RPA-ERP-03", squad: "Cadastro", status: "healthy", uptimePct: 99.2, successRate: 94, avgDuration: "0m 52s", queueDepth: 0, lastRun: "agora", slaTarget: 95, incidents24h: 1 },
  { id: "RPA-WEB-04", name: "RPA-WEB-04", squad: "Atendimento", status: "down", uptimePct: 78.1, successRate: 0, avgDuration: "—", queueDepth: 12, lastRun: "há 47 min", slaTarget: 99, incidents24h: 5 },
  { id: "RPA-MAIL-05", name: "RPA-MAIL-05", squad: "Comunicação", status: "maintenance", uptimePct: 100, successRate: 100, avgDuration: "0m 12s", queueDepth: 0, lastRun: "ontem", slaTarget: 90, incidents24h: 0 },
]

export const robotHealthLabels: Record<RobotHealthStatus, string> = {
  healthy: "Saudável",
  degraded: "Degradado",
  down: "Indisponível",
  maintenance: "Manutenção",
}

export type IncidentSeverity = "P1" | "P2" | "P3"

export interface Incident {
  id: string
  severity: IncidentSeverity
  title: string
  robot: string
  openedAt: string
  status: "open" | "investigating" | "mitigated"
  owner: string
}

export const activeIncidents: Incident[] = [
  { id: "INC-2148", severity: "P1", title: "RPA-WEB-04 fora do ar — fila acumulando", robot: "RPA-WEB-04", openedAt: "14:01", status: "investigating", owner: "Squad Atendimento" },
  { id: "INC-2147", severity: "P2", title: "Falhas recorrentes de seletor no SAP", robot: "RPA-SAP-01", openedAt: "13:22", status: "open", owner: "Squad Fiscal" },
  { id: "INC-2145", severity: "P3", title: "Latência elevada no ERP em horário de pico", robot: "RPA-ERP-03", openedAt: "11:48", status: "mitigated", owner: "Sustentação" },
]

export const slaOverview = {
  target: 95,
  current: 91.4,
  trend: -1.8,
  errorBudgetRemaining: 38,
  mttrMinutes: 17,
  mttdMinutes: 4,
}

export const queueOverview = {
  total: 17,
  byPriority: [
    { label: "Alta", value: 5, tone: "error" as const },
    { label: "Média", value: 8, tone: "warning" as const },
    { label: "Baixa", value: 4, tone: "info" as const },
  ],
}

/** Returns recent executions for the same robot, excluding the current one. */
export function getRelatedExecutions(currentId: string, robot: string, limit = 5): Execution[] {
  return executions.filter((e) => e.id !== currentId && e.robot === robot).slice(0, limit)
}

/** Returns recent executions with similar failures (same category). */
export function getSimilarFailures(currentId: string, category?: string, limit = 4): Execution[] {
  if (!category) return []
  return executions
    .filter((e) => e.id !== currentId && e.status === "error" && e.failure?.category === category)
    .slice(0, limit)
}

// ---- Advanced analytics datasets ----

export const failureHeatmap: { day: string; buckets: number[] }[] = [
  { day: "Seg", buckets: [0, 1, 2, 4, 6, 3, 2, 1] },
  { day: "Ter", buckets: [1, 0, 3, 5, 7, 4, 1, 0] },
  { day: "Qua", buckets: [0, 2, 4, 8, 9, 5, 2, 1] },
  { day: "Qui", buckets: [1, 1, 3, 6, 5, 3, 2, 0] },
  { day: "Sex", buckets: [0, 2, 5, 9, 11, 6, 3, 1] },
  { day: "Sáb", buckets: [0, 0, 1, 2, 3, 1, 0, 0] },
  { day: "Dom", buckets: [0, 0, 0, 1, 1, 0, 0, 0] },
]

export const heatmapHourLabels = ["0h", "3h", "6h", "9h", "12h", "15h", "18h", "21h"]

export const reliabilitySeries = [
  { day: "27/05", mttr: 24, mttd: 6 },
  { day: "28/05", mttr: 22, mttd: 5 },
  { day: "29/05", mttr: 28, mttd: 7 },
  { day: "30/05", mttr: 19, mttd: 4 },
  { day: "31/05", mttr: 21, mttd: 5 },
  { day: "01/06", mttr: 16, mttd: 4 },
  { day: "02/06", mttr: 17, mttd: 4 },
]

export const throughputComparison = [
  { day: "Seg", atual: 142, anterior: 128 },
  { day: "Ter", atual: 168, anterior: 151 },
  { day: "Qua", atual: 155, anterior: 162 },
  { day: "Qui", atual: 189, anterior: 170 },
  { day: "Sex", atual: 201, anterior: 184 },
  { day: "Sáb", atual: 64, anterior: 58 },
  { day: "Dom", atual: 31, anterior: 27 },
]

export const anomalies: { day: string; type: "drop" | "spike"; note: string }[] = [
  { day: "29/05", type: "drop", note: "Queda de 9pp — pico de falhas no SAP" },
  { day: "01/06", type: "spike", note: "Recuperação acima da média" },
]

// ---- Alerts ----

export type AlertSeverity = "critical" | "warning" | "info"
export type AlertChannel = "email" | "slack" | "teams" | "webhook" | "sms"
export type AlertRuleStatus = "active" | "paused" | "snoozed"

export interface AlertRule {
  id: string
  name: string
  description: string
  metric: string
  condition: string
  threshold: string
  severity: AlertSeverity
  channels: AlertChannel[]
  status: AlertRuleStatus
  lastTriggered?: string
  triggers24h: number
  owner: string
}

export const alertRules: AlertRule[] = [
  { id: "ALR-001", name: "Taxa de falhas > 10%", description: "Dispara quando a taxa de falhas em 15 min ultrapassa 10% para qualquer robô crítico.", metric: "failure_rate", condition: ">", threshold: "10% em 15min", severity: "critical", channels: ["slack", "email", "sms"], status: "active", lastTriggered: "há 12 min", triggers24h: 4, owner: "Squad Fiscal" },
  { id: "ALR-002", name: "Fila acumulando (>10 itens)", description: "Acompanha a profundidade da fila por robô e notifica quando ultrapassa o limite.", metric: "queue_depth", condition: ">", threshold: "10 itens", severity: "warning", channels: ["slack", "teams"], status: "active", lastTriggered: "há 47 min", triggers24h: 2, owner: "Sustentação" },
  { id: "ALR-003", name: "SLA mensal abaixo do alvo", description: "Avisa quando o SLA agregado projeta encerrar o mês abaixo de 95%.", metric: "sla_projection", condition: "<", threshold: "95%", severity: "warning", channels: ["email", "teams"], status: "active", lastTriggered: "há 3 h", triggers24h: 1, owner: "Operações" },
  { id: "ALR-004", name: "Robô indisponível > 5 min", description: "Detecta robôs sem heartbeat por mais de 5 minutos consecutivos.", metric: "uptime", condition: "<", threshold: "5 min sem heartbeat", severity: "critical", channels: ["sms", "slack", "webhook"], status: "active", lastTriggered: "há 1 h", triggers24h: 1, owner: "NOC" },
  { id: "ALR-005", name: "Duração acima do baseline", description: "Identifica execuções 2x mais lentas que o baseline aprendido para o robô.", metric: "duration_anomaly", condition: ">", threshold: "2× baseline", severity: "info", channels: ["slack"], status: "paused", triggers24h: 0, owner: "QA" },
  { id: "ALR-006", name: "Erros de autenticação recorrentes", description: "Dispara após 3 falhas de autenticação consecutivas no mesmo robô.", metric: "auth_failures", condition: ">=", threshold: "3 consecutivas", severity: "warning", channels: ["email", "slack"], status: "snoozed", lastTriggered: "ontem", triggers24h: 0, owner: "Arquitetura" },
]

export interface AlertEvent {
  id: string
  ruleId: string
  ruleName: string
  severity: AlertSeverity
  robot: string
  message: string
  triggeredAt: string
  acknowledged: boolean
  channel: AlertChannel
}

export const recentAlertEvents: AlertEvent[] = [
  { id: "EV-9821", ruleId: "ALR-001", ruleName: "Taxa de falhas > 10%", severity: "critical", robot: "RPA-SAP-01", message: "Taxa de falha atingiu 18% nos últimos 15 min", triggeredAt: "14:32", acknowledged: false, channel: "slack" },
  { id: "EV-9820", ruleId: "ALR-004", ruleName: "Robô indisponível > 5 min", severity: "critical", robot: "RPA-WEB-04", message: "Sem heartbeat há 47 minutos — escalado para NOC", triggeredAt: "14:01", acknowledged: true, channel: "sms" },
  { id: "EV-9817", ruleId: "ALR-002", ruleName: "Fila acumulando (>10 itens)", severity: "warning", robot: "RPA-WEB-04", message: "Fila chegou a 12 itens pendentes", triggeredAt: "13:54", acknowledged: true, channel: "teams" },
  { id: "EV-9812", ruleId: "ALR-003", ruleName: "SLA mensal abaixo do alvo", severity: "warning", robot: "todos", message: "Projeção mensal: 93.2% (alvo 95%)", triggeredAt: "11:20", acknowledged: false, channel: "email" },
  { id: "EV-9805", ruleId: "ALR-001", ruleName: "Taxa de falhas > 10%", severity: "critical", robot: "RPA-SAP-01", message: "Taxa de falha 12% — primeira ocorrência do dia", triggeredAt: "09:48", acknowledged: true, channel: "slack" },
  { id: "EV-9801", ruleId: "ALR-006", ruleName: "Erros de autenticação recorrentes", severity: "warning", robot: "RPA-ERP-03", message: "3 falhas de login consecutivas", triggeredAt: "08:15", acknowledged: true, channel: "email" },
]

export const alertChannelLabels: Record<AlertChannel, string> = {
  email: "E-mail",
  slack: "Slack",
  teams: "Teams",
  webhook: "Webhook",
  sms: "SMS",
}

export const alertSeverityLabels: Record<AlertSeverity, string> = {
  critical: "Crítico",
  warning: "Atenção",
  info: "Info",
}


