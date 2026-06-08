import { createFileRoute } from "@tanstack/react-router";
import { WebhookIntegration } from "@/components/qa-dashboard/webhook-integration";

export const Route = createFileRoute("/webhook")({
  head: () => ({
    meta: [
      { title: "Integração Webhook — AutoOps" },
      { name: "description", content: "Configuração de integrações via webhook para o AutoOps." },
    ],
  }),
  component: WebhookIntegration,
});
