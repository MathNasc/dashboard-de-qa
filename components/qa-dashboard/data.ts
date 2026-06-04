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
