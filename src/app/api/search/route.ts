import { NextRequest, NextResponse } from "next/server";

const DATAJUD_API_KEY =
  process.env.DATAJUD_API_KEY ??
  "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

const BASE_URL = "https://api-publica.datajud.cnj.jus.br";

// Índices do DataJud por sigla de tribunal
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
  TJDF: "api_publica_tjdft",
};

// Índices usados quando "todos os tribunais" é selecionado
const DEFAULT_INDICES = [
  "api_publica_stj",
  "api_publica_tst",
  "api_publica_trf1",
  "api_publica_trf2",
  "api_publica_trf3",
  "api_publica_trf4",
  "api_publica_trf5",
  "api_publica_tjsp",
  "api_publica_tjrj",
  "api_publica_tjmg",
];

interface DatajudHit {
  _id: string;
  _index: string;
  _source: {
    numeroProcesso?: string;
    classeProcessual?: { nome?: string };
    tribunal?: string;
    dataAjuizamento?: string;
    dataHoraUltimaAtualizacao?: string;
    orgaoJulgador?: { nome?: string };
    assuntos?: { nome?: string }[];
    movimentos?: { nome?: string; dataHora?: string }[];
    partes?: { nome?: string; tipo?: string }[];
    siglaTribunal?: string;
  };
}

function extractTribunal(hit: DatajudHit): string {
  const index = hit._index ?? "";
  for (const [sigla, idx] of Object.entries(TRIBUNAL_INDEX)) {
    if (index.includes(idx.replace("api_publica_", ""))) return sigla;
  }
  return hit._source.siglaTribunal ?? hit._source.tribunal ?? "CNJ";
}

function extractDate(hit: DatajudHit): string {
  const raw =
    hit._source.dataHoraUltimaAtualizacao ?? hit._source.dataAjuizamento ?? "";
  return raw ? raw.substring(0, 10) : "";
}

function getTribunalUrl(tribunal: string, numeroProcesso: string): string {
  const num = numeroProcesso.replace(/\D/g, "");
  const numFormatado = formatNumeroProcesso(numeroProcesso);

  const urls: Record<string, string> = {
    STJ: `https://processo.stj.jus.br/processo/pesquisa/?tipoPesquisa=tipoPesquisaNumeroRegistro&termo=${num}`,
    STF: `https://portal.stf.jus.br/processos/listarProcessos.asp?classe=&numeroProcesso=${num}`,
    TST: `https://consultaprocessual.tst.jus.br/consultaProcessual/consultaTstNumUnica.do?consulta=Consultar&conscsjt=&numeroTst=${numFormatado}`,
    TRF1: `https://processual.trf1.jus.br/consultaProcessual/processo.php?proc=${num}`,
    TRF2: `https://portal.trf2.jus.br/portal/processo/consulta-processual?numeroProcesso=${numFormatado}`,
    TRF3: `https://web.trf3.jus.br/base/base/Base/ResultadoPesquisa?TipoConsulta=1&NrProcesso=${num}`,
    TRF4: `https://jurisprudencia.trf4.jus.br/pesquisa/pesquisa.php?tipo=1&numero=${numFormatado}`,
    TRF5: `https://www.trf5.jus.br/processo/?numero=${num}`,
    TJSP: `https://esaj.tjsp.jus.br/cpopg/show.do?processo.codigo=&processo.foro=&processo.numero=${numFormatado}`,
    TJRJ: `https://www3.tjrj.jus.br/ejud/ConsultaProcesso.aspx?N=${num}`,
    TJMG: `https://processo.tjmg.jus.br/jurisprudencia/pesquisaPalavrasEspelhoAcordao.do?numeroProcesso=${num}`,
    TJRS: `https://www.tjrs.jus.br/site/processos/processo/?numero=${num}`,
    TJPR: `https://projudi.tjpr.jus.br/projudi/`,
    TJSC: `https://esaj.tjsc.jus.br/cpopg/search.do?conversationId=&cbPesquisa=NUMPROC&numeroDigitoAnoUnificado=${numFormatado}`,
    TJBA: `https://esaj.tjba.jus.br/cpopg/search.do?conversationId=&cbPesquisa=NUMPROC&numeroDigitoAnoUnificado=${numFormatado}`,
    TJGO: `https://projudi.tjgo.jus.br/BuscaProcesso?PaginaAtual=1&Historico=1&NumeroProcesso=${num}`,
    TJPE: `https://srv01.tjpe.jus.br/consultaprocessualunificada/processo/${numFormatado}`,
    TJCE: `https://esaj.tjce.jus.br/cpopg/search.do?conversationId=&cbPesquisa=NUMPROC&numeroDigitoAnoUnificado=${numFormatado}`,
    TJDFT: `https://www.tjdft.jus.br/consultas/jurisprudencia/pesquisa-de-jurisprudencia`,
  };

  return urls[tribunal] ?? `https://www.cnj.jus.br/pesquisas-judiciarias/datajud/`;
}

function formatNumeroProcesso(num: string): string {
  // Formata para o padrão CNJ: NNNNNNN-DD.AAAA.J.TT.OOOO
  const clean = num.replace(/\D/g, "");
  if (clean.length === 20) {
    return `${clean.slice(0, 7)}-${clean.slice(7, 9)}.${clean.slice(9, 13)}.${clean.slice(13, 14)}.${clean.slice(14, 16)}.${clean.slice(16)}`;
  }
  return num;
}

function formatRelator(nome?: string): string | undefined {
  if (!nome) return undefined;
  // Remove prefixos de gabinete e tribunal
  const cleaned = nome
    .replace(/GABINETE D[AO] (MINISTR[AO]|DESEMBARGADOR[A]?[O]?) /i, "")
    .replace(/GABINETE D[AO] /i, "")
    .replace(/Superior Tribunal de Justi.*$/i, "")
    .trim();
  if (!cleaned) return undefined;
  return cleaned
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function extractAssunto(hit: DatajudHit): string {
  const assuntos = hit._source.assuntos ?? [];
  return assuntos.map((a) => a.nome).filter(Boolean).join(", ") || "Sem assunto";
}

function extractEmenta(hit: DatajudHit): string {
  const classe = hit._source.classeProcessual?.nome ?? "";
  const assunto = extractAssunto(hit);
  const orgao = hit._source.orgaoJulgador?.nome ?? "";
  const partes = (hit._source.partes ?? [])
    .slice(0, 2)
    .map((p) => p.nome)
    .filter(Boolean)
    .join(" × ");

  const movimentos = (hit._source.movimentos ?? [])
    .slice(0, 3)
    .map((m) => m.nome)
    .filter(Boolean)
    .join(" → ");

  return [
    classe && `Classe: ${classe}.`,
    assunto && `Assunto: ${assunto}.`,
    orgao && `Órgão julgador: ${orgao}.`,
    partes && `Partes: ${partes}.`,
    movimentos && `Tramitação: ${movimentos}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

async function searchDatajud(
  indices: string[],
  query: string,
  periodo: string,
  page: number,
  pageSize: number
) {
  const must: object[] = [];

  if (query) {
    must.push({
      multi_match: {
        query,
        fields: [
          "assuntos.nome^3",
          "classeProcessual.nome^2",
          "orgaoJulgador.nome",
          "movimentos.nome",
          "partes.nome",
          "numeroProcesso",
        ],
        type: "best_fields",
        fuzziness: "AUTO",
      },
    });
  }

  if (periodo) {
    const days = parseInt(periodo);
    const from = new Date();
    from.setDate(from.getDate() - days);
    must.push({
      range: {
        dataHoraUltimaAtualizacao: {
          gte: from.toISOString().substring(0, 10),
        },
      },
    });
  }

  const body = {
    query: must.length > 0 ? { bool: { must } } : { match_all: {} },
    sort: [{ dataHoraUltimaAtualizacao: { order: "desc" } }],
    from: (page - 1) * pageSize,
    size: pageSize,
    _source: [
      "numeroProcesso",
      "classeProcessual",
      "tribunal",
      "siglaTribunal",
      "dataAjuizamento",
      "dataHoraUltimaAtualizacao",
      "orgaoJulgador",
      "assuntos",
      "movimentos",
      "partes",
    ],
  };

  const indexStr = indices.join(",");
  const url = `${BASE_URL}/${indexStr}/_search`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `APIKey ${DATAJUD_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DataJud error ${res.status}: ${text.substring(0, 200)}`);
  }

  return res.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";
  const tribunal = searchParams.get("tribunal") ?? "";
  const periodo = searchParams.get("periodo") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 10;

  const indices = tribunal
    ? [TRIBUNAL_INDEX[tribunal] ?? TRIBUNAL_INDEX.STJ]
    : DEFAULT_INDICES;

  try {
    const data = await searchDatajud(indices, query, periodo, page, pageSize);
    const hits: DatajudHit[] = data.hits?.hits ?? [];
    const total: number = data.hits?.total?.value ?? 0;

    const results = hits.map((hit) => {
      const tribunal = extractTribunal(hit);
      const numero = hit._source.numeroProcesso
        ? formatNumeroProcesso(hit._source.numeroProcesso)
        : "";
      const assunto = extractAssunto(hit);
      const classe = hit._source.classeProcessual?.nome ?? "";

      return {
        id: hit._id,
        titulo: [classe, numero].filter(Boolean).join(" ") || `Processo ${numero}`,
        tribunal,
        data: extractDate(hit),
        relator: formatRelator(hit._source.orgaoJulgador?.nome),
        ementa: extractEmenta(hit),
        tipo: classe || "Processo",
        assunto,
        url: getTribunalUrl(tribunal, hit._source.numeroProcesso ?? ""),
      };
    });

    return NextResponse.json({ results, total, page, pageSize });
  } catch (err) {
    console.error("DataJud error:", err);
    return NextResponse.json(
      { error: "Erro ao consultar o DataJud. Tente novamente." },
      { status: 502 }
    );
  }
}
