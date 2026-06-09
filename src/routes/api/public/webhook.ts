import { createFileRoute } from "@tanstack/react-router";

/**
 * AutoOps — Webhook universal de ingestão de eventos de automação.
 *
 * Endpoint:  POST /api/public/webhook
 *
 * Aceita QUALQUER payload JSON (ou form-data / texto puro). Os únicos campos
 * sugeridos são `event`, `status` e `source`, mas nada é obrigatório — o
 * objetivo é permitir que qualquer sistema externo (RPA, CI/CD, Zabbix,
 * scripts Bash, n8n, Make, Airflow, etc.) possa integrar sem fricção.
 *
 * Autenticação (opcional, recomendada em produção):
 *   - Header `Authorization: Bearer <AUTOOPS_WEBHOOK_SECRET>`, OU
 *   - Header `X-AutoOps-Token: <AUTOOPS_WEBHOOK_SECRET>`, OU
 *   - Query string `?token=<AUTOOPS_WEBHOOK_SECRET>`
 *
 * CORS liberado para qualquer origem (públicos por design).
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-AutoOps-Token, X-Requested-With",
  "Access-Control-Max-Age": "86400",
} as const;

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...(init.headers ?? {}),
    },
  });
}

function extractToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  const headerToken = request.headers.get("x-autoops-token");
  if (headerToken) return headerToken.trim();
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("token");
    if (q) return q.trim();
  } catch {
    /* noop */
  }
  return null;
}

async function parseBody(request: Request): Promise<{
  payload: unknown;
  contentType: string;
}> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return { payload: await request.json(), contentType };
    } catch {
      return { payload: null, contentType };
    }
  }
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData();
    const obj: Record<string, unknown> = {};
    form.forEach((value, key) => {
      obj[key] = typeof value === "string" ? value : `[file:${value.name}]`;
    });
    return { payload: obj, contentType };
  }
  const text = await request.text();
  return { payload: text, contentType: contentType || "text/plain" };
}

export const Route = createFileRoute("/api/public/webhook")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS_HEADERS }),

      GET: () =>
        json({
          service: "AutoOps Webhook",
          status: "online",
          message:
            "Envie POST com qualquer payload JSON. Use Authorization: Bearer <token> se AUTOOPS_WEBHOOK_SECRET estiver configurado.",
          docs: "/webhook",
          version: "1.0.0",
        }),

      POST: async ({ request }) => {
        const expected = process.env.AUTOOPS_WEBHOOK_SECRET?.trim();
        const provided = extractToken(request);

        if (expected && provided !== expected) {
          return json(
            {
              ok: false,
              error: "unauthorized",
              message:
                "Token inválido. Envie em Authorization: Bearer <token>, X-AutoOps-Token ou ?token=",
            },
            { status: 401 },
          );
        }

        const { payload, contentType } = await parseBody(request);
        const receivedAt = new Date().toISOString();
        const eventId = `evt_${Date.now().toString(36)}${Math.random()
          .toString(36)
          .slice(2, 8)}`;

        // Log estruturado — visível em Vercel/Cloudflare logs.
        console.log(
          JSON.stringify({
            level: "info",
            scope: "autoops.webhook",
            eventId,
            receivedAt,
            contentType,
            authenticated: Boolean(expected),
            payloadPreview:
              typeof payload === "string"
                ? payload.slice(0, 500)
                : payload,
          }),
        );

        return json({
          ok: true,
          eventId,
          receivedAt,
          contentType,
          authenticated: Boolean(expected),
          echo: payload,
        });
      },
    },
  },
});
