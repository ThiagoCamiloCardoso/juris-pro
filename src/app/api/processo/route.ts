import { NextRequest, NextResponse } from "next/server";

const DATAJUD_API_KEY =
  process.env.DATAJUD_API_KEY ??
  "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

const BASE_URL = "https://api-publica.datajud.cnj.jus.br";

const TRIBUNAL_INDEX: Record<string, string> = {
  STJ: "api_publica_stj",
  TST: "api_publica_tst",
  STM: "api_publica_stm",
  TRF1: "api_publica_trf1",
  TRF2: "api_publica_trf2",
  TRF3: "api_publica_trf3",
  TRF4: "api_publica_trf4",
  TRF5: "api_publica_trf5",
  TRF6: "api_publica_trf6",
  TJSP: "api_publica_tjsp",
  TJRJ: "api_publica_tjrj",
  TJMG: "api_publica_tjmg",
  TJRS: "api_publica_tjrs",
  TJPR: "api_publica_tjpr",
  TJSC: "api_publica_tjsc",
  TJBA: "api_publica_tjba",
  TJGO: "api_publica_tjgo",
  TJPE: "api_publica_tjpe",
  TJCE: "api_publica_tjce",
  TJAM: "api_publica_tjam",
  TJDFT: "api_publica_tjdft",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";
  const tribunal = searchParams.get("tribunal") ?? "STJ";

  const index = TRIBUNAL_INDEX[tribunal] ?? "api_publica_stj";

  const res = await fetch(`${BASE_URL}/${index}/_doc/${id}`, {
    headers: {
      Authorization: `APIKey ${DATAJUD_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Processo não encontrado" }, { status: 404 });
  }

  const data = await res.json();
  return NextResponse.json(data._source ?? {});
}
