"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Scale, ArrowLeft, Calendar, Building2, User, FileText,
  Clock, ChevronDown, ChevronUp, Loader2, AlertCircle, ExternalLink
} from "lucide-react";
import Link from "next/link";

interface Movimento {
  nome: string;
  dataHora?: string;
  complementosTabelados?: { nome: string; valor?: string }[];
}

interface Parte {
  nome: string;
  tipo?: string;
  polo?: string;
  advogados?: { nome: string; numeroOAB?: string }[];
}

interface Processo {
  numeroProcesso?: string;
  classeProcessual?: { nome: string; codigo?: number };
  siglaTribunal?: string;
  tribunal?: string;
  dataAjuizamento?: string;
  dataHoraUltimaAtualizacao?: string;
  orgaoJulgador?: { nome: string };
  assuntos?: { nome: string; codigo?: number }[];
  movimentos?: Movimento[];
  partes?: Parte[];
  prioridade?: string;
  grau?: string;
  nivelSigilo?: number;
}

const POLO_LABEL: Record<string, string> = {
  AT: "Autor",
  RE: "Réu",
  PA: "Parte",
  TE: "Terceiro",
  AD: "Advogado",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatNumero(num?: string) {
  if (!num) return "—";
  const clean = num.replace(/\D/g, "");
  if (clean.length === 20) {
    return `${clean.slice(0, 7)}-${clean.slice(7, 9)}.${clean.slice(9, 13)}.${clean.slice(13, 14)}.${clean.slice(14, 16)}.${clean.slice(16)}`;
  }
  return num;
}

export default function ProcessoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const tribunal = searchParams.get("tribunal") ?? "STJ";

  const [processo, setProcesso] = useState<Processo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movimentosExpanded, setMovimentosExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/processo?id=${encodeURIComponent(id)}&tribunal=${tribunal}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProcesso(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, tribunal]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm">Carregando processo...</p>
      </div>
    </div>
  );

  if (error || !processo) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-slate-700 font-semibold mb-1">Processo não encontrado</p>
        <p className="text-slate-500 text-sm mb-4">{error}</p>
        <Link href="/" className="text-blue-700 text-sm font-medium hover:underline">
          ← Voltar para busca
        </Link>
      </div>
    </div>
  );

  const movimentos = processo.movimentos ?? [];
  const partes = processo.partes ?? [];
  const assuntos = processo.assuntos ?? [];
  const movimentosVisiveis = movimentosExpanded ? movimentos : movimentos.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </Link>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-700" />
            <span className="font-bold text-slate-900">JurisPro</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Cabeçalho do processo */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
              {tribunal}
            </span>
            {processo.classeProcessual?.nome && (
              <span className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
                {processo.classeProcessual.nome}
              </span>
            )}
            {processo.grau && (
              <span className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
                {processo.grau}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {processo.classeProcessual?.nome ?? "Processo"}{" "}
            <span className="text-blue-700">{formatNumero(processo.numeroProcesso)}</span>
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <InfoItem icon={<Building2 className="w-4 h-4" />} label="Órgão Julgador" value={processo.orgaoJulgador?.nome} />
            <InfoItem icon={<Calendar className="w-4 h-4" />} label="Data de Ajuizamento" value={formatDate(processo.dataAjuizamento)} />
            <InfoItem icon={<Clock className="w-4 h-4" />} label="Última Atualização" value={formatDate(processo.dataHoraUltimaAtualizacao)} />
            <InfoItem icon={<FileText className="w-4 h-4" />} label="Número CNJ" value={formatNumero(processo.numeroProcesso)} />
          </div>
        </div>

        {/* Assuntos */}
        {assuntos.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Assuntos
            </h2>
            <div className="flex flex-wrap gap-2">
              {assuntos.map((a, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-lg border border-blue-100">
                  {a.nome}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Partes */}
        {partes.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Partes do Processo
            </h2>
            <div className="space-y-3">
              {partes.map((parte, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                      {POLO_LABEL[parte.polo ?? ""] ?? parte.polo ?? parte.tipo ?? "Parte"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{parte.nome}</p>
                    {parte.advogados && parte.advogados.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {parte.advogados.map((adv, j) => (
                          <p key={j} className="text-xs text-slate-500">
                            Adv: {adv.nome}
                            {adv.numeroOAB ? ` (OAB ${adv.numeroOAB})` : ""}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Movimentos / Tramitação */}
        {movimentos.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Tramitação ({movimentos.length} movimentos)
            </h2>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-4">
                {movimentosVisiveis.map((mov, i) => (
                  <div key={i} className="flex items-start gap-4 pl-8 relative">
                    <div className="absolute left-2 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{mov.nome}</p>
                      {mov.dataHora && (
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(mov.dataHora)}</p>
                      )}
                      {mov.complementosTabelados && mov.complementosTabelados.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {mov.complementosTabelados.map((c, j) => (
                            <span key={j} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {c.nome}{c.valor ? `: ${c.valor}` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {movimentos.length > 5 && (
              <button
                onClick={() => setMovimentosExpanded(!movimentosExpanded)}
                className="mt-4 flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
              >
                {movimentosExpanded ? (
                  <><ChevronUp className="w-4 h-4" /> Mostrar menos</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> Ver todos os {movimentos.length} movimentos</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Aviso + link externo */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Texto completo da decisão</p>
            <p className="text-sm text-amber-700 mb-3">
              O texto integral dos acórdãos e decisões está disponível no portal do tribunal. Acesse diretamente para ler a íntegra:
            </p>
            <a
              href={getTribunalUrl(tribunal, processo.numeroProcesso ?? "")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Acessar portal do {tribunal}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-800 font-medium mt-0.5">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function getTribunalUrl(tribunal: string, numeroProcesso: string): string {
  const num = numeroProcesso.replace(/\D/g, "");
  const urls: Record<string, string> = {
    STJ: `https://processo.stj.jus.br/processo/pesquisa/?tipoPesquisa=tipoPesquisaNumeroRegistro&termo=${num}`,
    STF: `https://portal.stf.jus.br/processos/listarProcessos.asp?numeroProcesso=${num}`,
    TST: `https://consultaprocessual.tst.jus.br/consultaProcessual/consultaTstNumUnica.do?consulta=Consultar&numeroTst=${num}`,
    TRF1: `https://processual.trf1.jus.br/consultaProcessual/processo.php?proc=${num}`,
    TRF4: `https://jurisprudencia.trf4.jus.br/pesquisa/pesquisa.php?tipo=1&numero=${num}`,
    TJSP: `https://esaj.tjsp.jus.br/cpopg/show.do?processo.numero=${num}`,
    TJRJ: `https://www3.tjrj.jus.br/ejud/ConsultaProcesso.aspx?N=${num}`,
    TJMG: `https://processo.tjmg.jus.br/jurisprudencia/pesquisaPalavrasEspelhoAcordao.do?numeroProcesso=${num}`,
  };
  return urls[tribunal] ?? `https://www.cnj.jus.br/`;
}
