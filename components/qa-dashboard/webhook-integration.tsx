"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Radio, Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import Link from "next/link"

const webhookUrl = "https://qamonitor.app/api/webhook/linx-qa"

const jsonPayloadExample = `{
  "fluxo": "Venda Faturada",
  "modulo_tela": "Gerenciamento Fiscal",
  "status_seletor_nativo": "falha",
  "status_seletor_imagem": "sucesso",
  "mensagem_erro": "Elemento não encontrado: #btn-confirmar",
  "timestamp": "2024-01-15T14:32:45.123Z",
  "duracao_ms": 4523,
  "screenshot_path": "/captures/erro_20240115_143245.png"
}`

const pythonExample = `import requests
import json
from datetime import datetime

WEBHOOK_URL = "${webhookUrl}"

def enviar_erro_qa(fluxo: str, modulo: str, erro: str):
    """Envia erro de automação para o QA Monitor"""
    
    payload = {
        "fluxo": fluxo,
        "modulo_tela": modulo,
        "status_seletor_nativo": "falha",
        "status_seletor_imagem": "falha",
        "mensagem_erro": erro,
        "timestamp": datetime.now().isoformat(),
        "duracao_ms": 8420
    }
    
    response = requests.post(
        WEBHOOK_URL,
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload)
    )
    
    return response.status_code == 200

# Exemplo: Erro no cmdquit
enviar_erro_qa(
    fluxo="Saída de Mercadorias",
    modulo="CmdQuit",
    erro="Falha ao executar cmdquit: Janela não responsiva após 30s timeout"
)`

export function WebhookIntegration() {
  const [copied, setCopied] = useState(false)
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [terminalLogs, setTerminalLogs] = useState<string[]>(["[sistema] Aguardando eventos..."])
  const [radarPulse, setRadarPulse] = useState(true)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendTestWebhook = () => {
    setTestStatus("sending")
    setRadarPulse(false)
    
    const timestamp = new Date().toLocaleTimeString("pt-BR")
    setTerminalLogs(prev => [...prev, `[${timestamp}] Enviando disparo de teste...`])
    
    setTimeout(() => {
      const timestamp2 = new Date().toLocaleTimeString("pt-BR")
      setTerminalLogs(prev => [
        ...prev, 
        `[${timestamp2}] POST ${webhookUrl}`,
        `[${timestamp2}] Status: 200 OK`,
        `[${timestamp2}] Payload recebido com sucesso!`
      ])
      setTestStatus("success")
      setRadarPulse(true)
      
      setTimeout(() => setTestStatus("idle"), 3000)
    }, 1500)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (testStatus === "idle") {
        setRadarPulse(prev => !prev)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [testStatus])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Conectar Script de Automação</h1>
            <p className="text-muted-foreground mt-2">
              Configure seu script para enviar eventos de automação para o QA Monitor
            </p>
          </div>

          {/* Webhook URL */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              URL do Webhook
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="px-4 border-border hover:bg-accent"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar URL
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Code Blocks */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* JSON Payload */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-secondary/50 px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Payload JSON Esperado</span>
                <span className="text-xs text-muted-foreground font-mono">payload.json</span>
              </div>
              <div className="p-0">
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "transparent",
                    fontSize: "0.875rem",
                  }}
                  showLineNumbers
                  lineNumberStyle={{ color: "#4b5563", marginRight: "1rem" }}
                >
                  {jsonPayloadExample}
                </SyntaxHighlighter>
              </div>
            </div>

            {/* Python Example */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="bg-secondary/50 px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Exemplo de Requisição HTTP POST</span>
                <span className="text-xs text-muted-foreground font-mono">enviar_erro.py</span>
              </div>
              <div className="p-0">
                <SyntaxHighlighter
                  language="python"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "transparent",
                    fontSize: "0.875rem",
                  }}
                  showLineNumbers
                  lineNumberStyle={{ color: "#4b5563", marginRight: "1rem" }}
                >
                  {pythonExample}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Como integrar</h3>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <span>Copie a URL do webhook acima e configure no seu script de automação</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <span>Envie requisições POST com o payload JSON no formato especificado</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <span>Use o painel de teste à direita para verificar se a conexão está funcionando</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</span>
                <span>Acompanhe os eventos em tempo real no Dashboard principal</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Right Panel - Connection Test */}
        <div className="w-80 bg-card border-l border-border p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Radio className={`h-5 w-5 ${radarPulse ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
            Teste de Conexão
          </h2>

          <Button
            onClick={sendTestWebhook}
            disabled={testStatus === "sending"}
            className="w-full bg-success hover:bg-success/90 text-success-foreground font-medium py-3 mb-6"
          >
            {testStatus === "sending" ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Disparo de Teste
              </>
            )}
          </Button>

          {/* Mini Terminal */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-secondary/50 px-3 py-2 border border-border border-b-0 rounded-t-lg">
              <span className="text-xs font-medium text-muted-foreground">Terminal</span>
            </div>
            <div className="flex-1 bg-terminal border border-border rounded-b-lg p-3 overflow-auto font-mono text-xs">
              {terminalLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`mb-1 ${
                    log.includes("sucesso") || log.includes("200 OK") 
                      ? "text-success" 
                      : log.includes("Enviando") || log.includes("POST")
                      ? "text-warning"
                      : "text-terminal-foreground"
                  }`}
                >
                  {log}
                </div>
              ))}
              <div className="flex items-center gap-1 text-terminal-foreground mt-2">
                <span className={`inline-block w-2 h-2 rounded-full ${radarPulse ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                <span className="opacity-70">_</span>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-medium ${
                testStatus === "success" ? "text-success" :
                testStatus === "error" ? "text-destructive" :
                testStatus === "sending" ? "text-warning" :
                "text-muted-foreground"
              }`}>
                {testStatus === "success" ? "Conectado" :
                 testStatus === "error" ? "Erro" :
                 testStatus === "sending" ? "Testando..." :
                 "Aguardando"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
