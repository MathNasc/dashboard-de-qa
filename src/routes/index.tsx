import { createFileRoute } from "@tanstack/react-router";
import { QADashboard } from "@/components/qa-dashboard/qa-dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AutoOps — Observabilidade de Automações" },
      {
        name: "description",
        content:
          "Plataforma de observabilidade e monitoramento de automações corporativas (QA, RPA e Bots de Processos).",
      },
    ],
  }),
  component: QADashboard,
});
