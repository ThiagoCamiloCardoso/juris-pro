import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { ementa, titulo, tribunal } = await req.json();

  if (!ementa || typeof ementa !== "string") {
    return NextResponse.json({ error: "Ementa obrigatória" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `Você é um assistente jurídico especializado. Analise a decisão abaixo e forneça um resumo estruturado e claro para advogados.

Tribunal: ${tribunal ?? ""}
Processo/Título: ${titulo ?? ""}
Ementa:
${ementa}

Responda em português brasileiro com o seguinte formato:

**Tese jurídica:** (em 1-2 frases, a posição adotada pelo tribunal)

**Resultado:** (procedente/improcedente/parcialmente procedente + breve explicação)

**Principais fundamentos:** (3-4 bullet points com os argumentos centrais)

**Relevância prática:** (1-2 frases sobre impacto para advogados e jurisdicionados)`,
      },
    ],
  });

  const resumo = message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ resumo });
}
