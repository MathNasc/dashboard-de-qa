"use client"

import { useState, useEffect, useMemo } from "react"
import { Copy, Check, Radio, Send, ArrowLeft, ShieldCheck, ShieldAlert, Globe, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Link } from "@tanstack/react-router"

const WEBHOOK_PATH = "/api/public/webhook"

function buildSnippets(url: string, token: string) {
  const auth = token ? `\n  -H "Authorization: Bearer ${token}" \\` : ""
  const headers = token ? `,\n    "Authorization": "Bearer ${token}"` : ""
  const pyHeaders = token ? `, "Authorization": "Bearer ${token}"` : ""
  const psHeaders = token ? `; "Authorization" = "Bearer ${token}"` : ""

  return {
    json: `{
  "event": "execution.failed",
  "source": "robot-fiscal-prod",
  "status": "failure",
  "module": "Gerenciamento Fiscal",
  "flow": "Venda Faturada",
  "message": "Elemento nao encontrado: #btn-confirmar",
  "duration_ms": 4523,
  "timestamp": "${new Date().toISOString()}",
  "metadata": {
    "host": "rpa-node-12",
    "screenshot": "https://cdn.example.com/evidence/e1.png"
  }
}`,
    curl: `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\${auth}
  -d '{
    "event": "execution.failed",
    "source": "robot-fiscal-prod",
    "status": "failure",
    "message": "Timeout aguardando janela"
  }'`,
    node: `// Node 18+ (fetch nativo)
await fetch("${url}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"${headers}
  },
  body: JSON.stringify({
    event: "execution.completed",
    source: "ci-pipeline",
    status: "success",
    duration_ms: 12480,
    timestamp: new Date().toISOString()
  })
})`,
    python: `import requests, datetime

requests.post(
    "${url}",
    headers={"Content-Type": "application/json"${pyHeaders}},
    json={
        "event": "execution.failed",
        "source": "rpa-billing",
        "status": "failure",
        "message": "Falha no cmdquit",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    },
    timeout=10,
)`,
    php: `<?php
$ch = curl_init("${url}");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"${token ? `,\n    "Authorization: Bearer ${token}"` : ""}
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "event"  => "execution.failed",
    "source" => "legacy-erp",
    "status" => "failure",
    "message" => "Conexao recusada"
]));
$response = curl_exec($ch);
curl_close($ch);`,
    powershell: `$body = @{
  event  = "execution.failed"
  source = "ps-agent"
  status = "failure"
  message = "Servico nao respondeu"
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json"${psHeaders} }

Invoke-RestMethod -Uri "${url}" -Method POST -Headers $headers -Body $body`,
  }
}

type LogLine = { ts: string; text: string; level: "info" | "ok" | "warn" | "err" }

export function WebhookIntegration() {
  const [origin, setOrigin] = useState("https://your-app.vercel.app")
  const [token, setToken] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [logs, setLogs] = useState<LogLine[]>([
    { ts: now(), text: "Aguardando primeiro disparo...", level: "info" },
  ])

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin)
  }, [])

  const fullUrl = `${origin}${WEBHOOK_PATH}`
  const snippets = useMemo(() => buildSnippets(fullUrl, token), [fullUrl, token])

  function pushLog(text: string, level: LogLine["level"] = "info") {
    setLogs((prev) => [...prev.slice(-50), { ts: now(), text, level }])
  }

  async function copy(value: string, key: string) {
    await navigator.clipboard.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  async function sendTest() {
    setTestStatus("sending")
    pushLog(`POST ${fullUrl}`, "warn")
    try {
      const res = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          event: "test.ping",
          source: "autoops-ui",
          status: "success",
          message: "Disparo de teste a partir do painel",
          timestamp: new Date().toISOString(),
        }),
      })
      const data = await res.json().catch(() => null)
      pushLog(`HTTP ${res.status} ${res.statusText}`, res.ok ? "ok" : "err")
      if (data?.eventId) pushLog(`eventId=${data.eventId} authenticated=${data.authenticated}`, "ok")
      setTestStatus(res.ok ? "success" : "error")
    } catch (e) {
      pushLog(`Falha de rede: ${(e as Error).message}`, "err")
      setTestStatus("error")
    } finally {
      setTimeout(() => setTestStatus("idle"), 3500)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col xl:flex-row h-screen">
        {/* Main */}
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-success/30 text-success">
                  <Globe className="h-3 w-3 mr-1" /> Universal
                </Badge>
                <Badge variant="outline">
                  <Zap className="h-3 w-3 mr-1" /> POST · JSON · Form · Text
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">Webhook de Ingestão AutoOps</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Endpoint universal para qualquer sistema enviar eventos de automação:
                RPA, CI/CD, scripts Bash, n8n, Make, Zabbix, Airflow, ERPs legados, etc.
                Aceita qualquer payload — só o método <code className="text-foreground font-mono">POST</code> é obrigatório.
              </p>
            </div>
          </div>

          {/* URL + Token */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2 space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">URL do Webhook</Label>
              <div className="flex gap-2">
                <Input readOnly value={fullUrl} className="font-mono text-sm" />
                <Button variant="outline" onClick={() => copy(fullUrl, "url")}>
                  {copied === "url" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                {token ? <ShieldCheck className="h-3 w-3 text-success" /> : <ShieldAlert className="h-3 w-3 text-warning" />}
                Token (opcional)
              </Label>
              <Input
                placeholder="AUTOOPS_WEBHOOK_SECRET"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Spec */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <SpecCard label="Método" value="POST" />
            <SpecCard label="Content-Type aceitos" value="application/json · form · text" />
            <SpecCard label="Autenticação" value={token ? "Bearer Token" : "Aberto (defina o secret)"} />
          </div>

          {/* Code tabs */}
          <Tabs defaultValue="curl" className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h2 className="text-lg font-semibold">Exemplos de integração</h2>
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="node">Node.js</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="php">PHP</TabsTrigger>
                <TabsTrigger value="powershell">PowerShell</TabsTrigger>
                <TabsTrigger value="json">Payload</TabsTrigger>
              </TabsList>
            </div>
            {(["curl", "node", "python", "php", "powershell", "json"] as const).map((key) => (
              <TabsContent key={key} value={key}>
                <CodeBlock
                  code={snippets[key]}
                  language={key === "json" ? "json" : key === "powershell" ? "powershell" : key === "node" ? "javascript" : key}
                  onCopy={() => copy(snippets[key], key)}
                  copied={copied === key}
                />
              </TabsContent>
            ))}
          </Tabs>

          {/* Headers reference */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Referência rápida de Headers</h3>
            <div className="space-y-2 text-sm font-mono">
              <HeaderRow name="Content-Type" value="application/json" required />
              <HeaderRow name="Authorization" value="Bearer <AUTOOPS_WEBHOOK_SECRET>" optional />
              <HeaderRow name="X-AutoOps-Token" value="<AUTOOPS_WEBHOOK_SECRET>" optional note="alternativa ao Authorization" />
            </div>
          </div>

          {/* Response example */}
          <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
            <div className="bg-secondary/50 px-4 py-3 border-b border-border">
              <span className="text-sm font-medium">Resposta esperada (HTTP 200)</span>
            </div>
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{ margin: 0, padding: "1rem", background: "transparent", fontSize: "0.875rem" }}
            >
{`{
  "ok": true,
  "eventId": "evt_lz3kf8x9a2",
  "receivedAt": "${new Date().toISOString()}",
  "contentType": "application/json",
  "authenticated": true,
  "echo": { /* seu payload de volta */ }
}`}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Right panel — live tester */}
        <div className="w-full xl:w-96 bg-card border-t xl:border-t-0 xl:border-l border-border p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Radio className={`h-5 w-5 ${testStatus === "sending" ? "text-warning animate-pulse" : "text-primary"}`} />
            Teste ao vivo
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Dispara um POST real para o endpoint acima usando o token informado.
          </p>

          <Button
            onClick={sendTest}
            disabled={testStatus === "sending"}
            className="w-full mb-4"
          >
            {testStatus === "sending" ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar disparo de teste
              </>
            )}
          </Button>

          <div className="flex-1 flex flex-col min-h-[240px]">
            <div className="bg-secondary/50 px-3 py-2 border border-border border-b-0 rounded-t-lg flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Log do teste</span>
              <span className={`text-xs font-medium ${
                testStatus === "success" ? "text-success" :
                testStatus === "error" ? "text-destructive" :
                testStatus === "sending" ? "text-warning" :
                "text-muted-foreground"
              }`}>
                {testStatus === "success" ? "200 OK" :
                 testStatus === "error" ? "ERROR" :
                 testStatus === "sending" ? "..." : "idle"}
              </span>
            </div>
            <div className="flex-1 bg-background border border-border rounded-b-lg p-3 overflow-auto font-mono text-xs space-y-1">
              {logs.map((l, i) => (
                <div key={i} className={
                  l.level === "ok" ? "text-success" :
                  l.level === "warn" ? "text-warning" :
                  l.level === "err" ? "text-destructive" :
                  "text-muted-foreground"
                }>
                  <span className="opacity-50">[{l.ts}]</span> {l.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="font-mono text-sm">{value}</div>
    </div>
  )
}

function CodeBlock({ code, language, onCopy, copied }: { code: string; language: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden relative">
      <Button size="sm" variant="ghost" onClick={onCopy} className="absolute top-2 right-2 z-10 h-7">
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: "1rem", background: "transparent", fontSize: "0.85rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

function HeaderRow({ name, value, required, optional, note }: { name: string; value: string; required?: boolean; optional?: boolean; note?: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-foreground min-w-[160px]">{name}</span>
      <span className="text-muted-foreground flex-1">{value}</span>
      {required && <Badge variant="outline" className="border-destructive/40 text-destructive text-xs">obrigatório</Badge>}
      {optional && <Badge variant="outline" className="text-xs">opcional</Badge>}
      {note && <span className="text-xs text-muted-foreground italic">{note}</span>}
    </div>
  )
}

function now() {
  return new Date().toLocaleTimeString("pt-BR", { hour12: false })
}
