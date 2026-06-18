# Deploy do AutoOps na Vercel

Este projeto (TanStack Start + Vite + Nitro) está pronto para deploy na Vercel.

## Como fazer o deploy

### 1. Via Dashboard (recomendado)
1. Acesse https://vercel.com/new
2. Importe o repositório do GitHub
3. A Vercel detectará o `vercel.json` automaticamente
4. Clique em **Deploy**

Nenhuma configuração manual de Build/Output é necessária — está tudo em `vercel.json`:
- `NITRO_PRESET=vercel` faz o Nitro gerar o output no formato Vercel Build Output API v3
- Output em `.vercel/output` é detectado automaticamente pela Vercel

### 2. Via CLI
```bash
npm i -g vercel
vercel           # primeiro deploy / preview
vercel --prod    # promover para produção
```

## Variáveis de ambiente

Defina no **Project Settings → Environment Variables** da Vercel:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `AUTOOPS_WEBHOOK_SECRET` | opcional | Token Bearer usado para autenticar chamadas ao webhook `/api/public/webhook`. Se vazio, o endpoint aceita chamadas sem autenticação (não recomendado em produção). |
| `LOVABLE_API_KEY` | opcional | Necessária apenas se for usar o diagnóstico de IA do AutoOps. |

Depois de adicionar/alterar variáveis, faça **Redeploy** para aplicar.

## Domínio customizado
`Project → Settings → Domains → Add` e siga o passo a passo de DNS.

## Estrutura do build
- `vite build` → roda o Nitro do TanStack Start com preset `vercel`
- Saída final em `.vercel/output` (Edge + Static)
- Server functions e rotas `/api/**` rodam como Vercel Functions
