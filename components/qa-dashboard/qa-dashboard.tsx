"use client"

import { useState } from "react"
import { ExecutionSidebar, type Execution } from "./execution-sidebar"
import { ExecutionDetail } from "./execution-detail"
import type { Step } from "./execution-stepper"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const mockExecutions: Execution[] = [
  {
    id: "1",
    name: "Fluxo Venda Faturada",
    duration: "2m 34s",
    status: "error",
    timestamp: "02/06/2026 14:32:15",
  },
  {
    id: "2",
    name: "Saída de Mercadorias",
    duration: "1m 12s",
    status: "success",
    timestamp: "02/06/2026 14:28:03",
  },
  {
    id: "3",
    name: "Entrada de Notas",
    duration: "3m 45s",
    status: "success",
    timestamp: "02/06/2026 14:15:22",
  },
  {
    id: "4",
    name: "Cadastro de Produtos",
    duration: "0m 58s",
    status: "success",
    timestamp: "02/06/2026 14:10:11",
  },
  {
    id: "5",
    name: "Fluxo Devolução",
    duration: "1m 47s",
    status: "error",
    timestamp: "02/06/2026 13:55:48",
  },
  {
    id: "6",
    name: "Conferência de Estoque",
    duration: "4m 22s",
    status: "success",
    timestamp: "02/06/2026 13:45:30",
  },
]

const mockSteps: Record<string, Step[]> = {
  "1": [
    { id: "1", name: "Acesso Caixa", status: "completed" },
    { id: "2", name: "Gerenciamento Fiscal", status: "error" },
    { id: "3", name: "Emissão NF", status: "pending" },
    { id: "4", name: "CmdQuit", status: "pending" },
  ],
  "2": [
    { id: "1", name: "Login Sistema", status: "completed" },
    { id: "2", name: "Consulta Estoque", status: "completed" },
    { id: "3", name: "Separação", status: "completed" },
    { id: "4", name: "Expedição", status: "completed" },
  ],
  "5": [
    { id: "1", name: "Buscar Venda", status: "completed" },
    { id: "2", name: "Estornar Itens", status: "error" },
    { id: "3", name: "Gerar Nota", status: "pending" },
    { id: "4", name: "Finalizar", status: "pending" },
  ],
}

const mockLogs: Record<string, string[]> = {
  "1": [
    "[2026-06-02 14:32:15] INFO: Iniciando execução do fluxo Venda Faturada",
    "[2026-06-02 14:32:16] INFO: Conectando ao sistema SAP...",
    "[2026-06-02 14:32:18] OK: Conexão estabelecida com sucesso",
    "[2026-06-02 14:32:19] INFO: Navegando para módulo Acesso Caixa",
    "[2026-06-02 14:32:25] OK: Módulo Acesso Caixa carregado",
    "[2026-06-02 14:32:26] INFO: Executando validações de sessão...",
    "[2026-06-02 14:32:28] OK: Sessão validada com sucesso",
    "[2026-06-02 14:32:30] INFO: Navegando para Gerenciamento Fiscal",
    "[2026-06-02 14:32:45] AVISO: Tempo de carregamento acima do esperado",
    "[2026-06-02 14:33:00] INFO: Tentando localizar elemento de interface...",
    "[2026-06-02 14:33:15] AVISO: Elemento não encontrado, tentativa 1/3",
    "[2026-06-02 14:33:30] AVISO: Elemento não encontrado, tentativa 2/3",
    "[2026-06-02 14:33:45] AVISO: Elemento não encontrado, tentativa 3/3",
    "[2026-06-02 14:34:00] ERRO: Falha ao localizar seletor UI nativo",
    "[2026-06-02 14:34:01] ERRO: ElementNotFoundException: O robô não conseguiu encontrar o seletor UI nativo especificado",
    "[2026-06-02 14:34:02] INFO: Captura de tela salva em /logs/screenshots/error_20260602_143402.png",
    "[2026-06-02 14:34:03] INFO: Execução pausada - aguardando intervenção manual",
  ],
  "2": [
    "[2026-06-02 14:28:03] INFO: Iniciando execução do fluxo Saída de Mercadorias",
    "[2026-06-02 14:28:05] OK: Conexão estabelecida",
    "[2026-06-02 14:28:10] OK: Login realizado com sucesso",
    "[2026-06-02 14:28:15] INFO: Consultando estoque disponível...",
    "[2026-06-02 14:28:25] OK: Estoque validado",
    "[2026-06-02 14:28:45] OK: Separação concluída",
    "[2026-06-02 14:29:10] OK: Expedição finalizada com sucesso",
    "[2026-06-02 14:29:15] INFO: Fluxo concluído sem erros",
  ],
}

const mockErrorDetails: Record<string, { selector: string; screenshot: string }> = {
  "1": {
    selector: "wnd[0]/usr/cntlGRID1/shellcont/shell/rowcol[2,3]",
    screenshot: "/logs/screenshots/error_20260602_143402.png",
  },
  "5": {
    selector: "wnd[0]/usr/tabsTABSTRIP/tabpTAB01/ssubSCREEN:SAPLDEV:0100",
    screenshot: "/logs/screenshots/error_20260602_135548.png",
  },
}

export function QADashboard() {
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>("1")
  const [showScreenshot, setShowScreenshot] = useState(false)
  const [showStopConfirm, setShowStopConfirm] = useState(false)

  const selectedExecution = mockExecutions.find(
    (e) => e.id === selectedExecutionId
  )!

  const steps = mockSteps[selectedExecutionId] || [
    { id: "1", name: "Início", status: "completed" as const },
    { id: "2", name: "Processamento", status: "completed" as const },
    { id: "3", name: "Validação", status: "completed" as const },
    { id: "4", name: "Conclusão", status: "completed" as const },
  ]

  const logs = mockLogs[selectedExecutionId] || [
    `[${selectedExecution.timestamp}] INFO: Execução concluída com sucesso`,
  ]

  const errorDetails = mockErrorDetails[selectedExecutionId]

  return (
    <div className="flex h-screen w-full bg-background">
      <ExecutionSidebar
        executions={mockExecutions}
        selectedId={selectedExecutionId}
        onSelect={setSelectedExecutionId}
      />
      <ExecutionDetail
        execution={selectedExecution}
        steps={steps}
        logs={logs}
        errorDetails={errorDetails}
        onViewScreenshot={() => setShowScreenshot(true)}
        onForceStop={() => setShowStopConfirm(true)}
      />

      {/* Screenshot Dialog */}
      <Dialog open={showScreenshot} onOpenChange={setShowScreenshot}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Captura de Tela do Erro</DialogTitle>
            <DialogDescription>
              Captura do momento em que o erro ocorreu
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-4 min-h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="font-mono text-sm mb-2">
                {errorDetails?.screenshot || "Nenhuma captura disponível"}
              </p>
              <div className="w-full h-48 bg-terminal rounded border border-border flex items-center justify-center">
                <span className="text-terminal-foreground font-mono text-xs">
                  [Imagem da captura de tela seria exibida aqui]
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Force Stop Confirmation */}
      <AlertDialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Parada Forçada</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja forçar a parada desta execução? Esta ação
              não pode ser desfeita e pode deixar o sistema em estado
              inconsistente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                console.log("[v0] Forçando parada da execução:", selectedExecutionId)
                setShowStopConfirm(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Forçar Parada
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
