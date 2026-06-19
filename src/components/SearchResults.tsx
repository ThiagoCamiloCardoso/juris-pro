"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles, ExternalLink, ChevronDown, ChevronUp, Loader2, AlertCircle, Building2, FileSearch } from "lucide-react";
import Link from "next/link";

interface Jurisprudencia {
  id: string;
  titulo: string;
  tribunal: string;
  data: string;
  relator?: string;
  ementa: string;
  resumoIA?: string;
  url?: string;
  tipo: string;
}

interface Props {
  query: string;
  tribunal: string;
  periodo: string;
}

const TRIBUNAL_COLORS: Record<string, string> = {
  STF: "bg-red-100 text-red-700",
  STJ: "bg-blue-100 text-blue-700",
  TST: "bg-orange-100 text-orange-700",
  TRF1: "bg-purple-100 text-purple-700",
  TRF2: "bg-purple-100 text-purple-700",
  TRF3: "bg-purple-100 text-purple-700",
  TRF4: "bg-purple-100 text-purple-700",
  TRF5: "bg-purple-100 text-purple-700",
  TJSP: "bg-green-100 text-green-700",
  TJRJ: "bg-teal-100 text-teal-700",
  TJMG: "bg-yellow-100 text-yellow-700",
};

export default function SearchResults({ query, tribunal, periodo }: Props) {
  const [results, setResults] = useState<Jurisprudencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingResumo, setLoadingResumo] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ query, page: String(page) });
      if (tribunal) params.set("tribunal", tribunal);
      if (periodo) params.set("periodo", periodo);

      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error("Erro ao buscar jurisprudências");
      const data = await res.json();
      setResults(data.results);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [query, tribunal, periodo, page]);

  useEffect(() => {
    setPage(1);
    setResults([]);
  }, [query, tribunal, periodo]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleResumoIA = async (item: Jurisprudencia) => {
    if (item.resumoIA) {
      setExpandedId(expandedId === item.id ? null : item.id);
      return;
    }

    setLoadingResumo(item.id);
    setExpandedId(item.id);

    try {
      const res = await fetch("/api/resumo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ementa: item.ementa, titulo: item.titulo, tribunal: item.tribunal }),
      });
      if (!res.ok) throw new Error("Erro ao gerar resumo");
      const data = await res.json();
      setResults(prev =>
        prev.map(r => r.id === item.id ? { ...r, resumoIA: data.resumo } : r)
      );
    } catch {
      setResults(prev =>
        prev.map(r => r.id === item.id ? { ...r, resumoIA: "Não foi possível gerar o resumo." } : r)
      );
    } finally {
      setLoadingResumo(null);
    }
  };

  if (loading && results.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm">Buscando jurisprudências...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Summary */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{total.toLocaleString("pt-BR")}</span> resultados para{" "}
          <span className="font-semibold text-slate-800">&ldquo;{query}&rdquo;</span>
          {tribunal && <span> · {tribunal}</span>}
        </p>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.map(item => (
          <article key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TRIBUNAL_COLORS[item.tribunal] ?? "bg-slate-100 text-slate-600"}`}>
                  {item.tribunal}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                  {item.tipo}
                </span>
                <span className="text-xs text-slate-400 ml-auto">{formatDate(item.data)}</span>
              </div>

              <h3 className="font-semibold text-slate-900 text-base leading-snug mb-2">
                {item.titulo}
              </h3>

              {item.relator && (
                <p className="text-xs text-slate-500 mb-3">
                  <span className="font-medium">Relator:</span> {item.relator}
                </p>
              )}

              <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                {item.ementa}
              </p>

              {/* Expanded AI summary */}
              {expandedId === item.id && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Resumo gerado por IA</span>
                  </div>
                  {loadingResumo === item.id ? (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando resumo...
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {item.resumoIA}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 flex-wrap">
                <button
                  onClick={() => handleResumoIA(item)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {expandedId === item.id ? "Ocultar resumo" : "Resumo IA"}
                  {expandedId === item.id
                    ? <ChevronUp className="w-3.5 h-3.5" />
                    : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <div className="ml-auto flex items-center gap-2">
                  <Link
                    href={`/processo/${encodeURIComponent(item.id)}?tribunal=${item.tribunal}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 border border-slate-300 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    Ver detalhes
                  </Link>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {item.tribunal}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="font-semibold text-slate-700 mb-1">Nenhum resultado encontrado</p>
          <p className="text-sm">Tente termos mais gerais ou remova alguns filtros.</p>
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-3 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-slate-500">
            Página {page} de {Math.ceil(total / 10)}
          </span>
          <button
            disabled={page >= Math.ceil(total / 10)}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}
