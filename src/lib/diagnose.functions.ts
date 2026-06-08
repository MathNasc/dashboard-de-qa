import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const DiagnoseInput = z.object({
  executionName: z.string().min(1),
  robot: z.string().min(1),
  category: z.string().min(1),
  status: z.string(),
  failureSummary: z.string().optional(),
  failureCategory: z.string().optional(),
  rootCause: z.string().optional(),
  selector: z.string().optional(),
  errorLogs: z.array(z.string()).max(40).optional(),
  similarFailures: z
    .array(
      z.object({
        name: z.string(),
        when: z.string(),
        summary: z.string().optional(),
      }),
    )
    .max(6)
    .optional(),
});

const DiagnoseSchema = z.object({
  rootCauseHypothesis: z.string(),
  confidence: z.enum(["alta", "média", "baixa"]),
  blastRadius: z.string(),
  recurringPattern: z.string(),
  recommendedActions: z.array(z.string()).min(2).max(6),
  preventiveMeasures: z.array(z.string()).min(2).max(5),
  escalationSuggestion: z.string(),
});

export type AiDiagnosis = z.infer<typeof DiagnoseSchema>;

export const diagnoseExecution = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => DiagnoseInput.parse(input))
  .handler(async ({ data }): Promise<AiDiagnosis> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY não configurada");

    const gateway = createLovableAiGatewayProvider(key);

    const contextBlock = [
      `Execução: ${data.executionName}`,
      `Robô: ${data.robot}`,
      `Categoria do robô: ${data.category}`,
      `Status: ${data.status}`,
      data.failureSummary ? `Resumo da falha: ${data.failureSummary}` : null,
      data.failureCategory ? `Categoria da falha: ${data.failureCategory}` : null,
      data.rootCause ? `Causa raiz preliminar: ${data.rootCause}` : null,
      data.selector ? `Seletor envolvido: ${data.selector}` : null,
      data.errorLogs?.length ? `Logs relevantes:\n${data.errorLogs.join("\n")}` : null,
      data.similarFailures?.length
        ? `Falhas similares recentes:\n${data.similarFailures
            .map((s) => `- ${s.name} (${s.when}) ${s.summary ?? ""}`)
            .join("\n")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const { experimental_output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      experimental_output: Output.object({ schema: DiagnoseSchema }),
      system:
        "Você é o analista sênior de observabilidade do AutoOps, especialista em automações RPA, QA e processos corporativos. Responda sempre em português do Brasil, com linguagem técnica, objetiva e acionável. Não invente fatos: baseie-se apenas no contexto fornecido.",
      prompt: `Analise a execução abaixo e produza um diagnóstico aprofundado, considerando padrão recorrente, raio de impacto e ações recomendadas para times de Sustentação/RPA.\n\n${contextBlock}`,
    });

    return experimental_output;
  });
