"use client";

import { useState } from "react";
import { Search, Scale, BookOpen, Sparkles, ChevronDown, LogIn, Menu, X, Filter, Calendar, Building2 } from "lucide-react";
import SearchResults from "@/components/SearchResults";

const TRIBUNAIS = [
  { value: "", label: "Todos os Tribunais" },
  { value: "STF", label: "STF — Supremo Tribunal Federal" },
  { value: "STJ", label: "STJ — Superior Tribunal de Justiça" },
  { value: "TST", label: "TST — Tribunal Superior do Trabalho" },
  { value: "TRF1", label: "TRF 1ª Região" },
  { value: "TRF2", label: "TRF 2ª Região" },
  { value: "TRF3", label: "TRF 3ª Região" },
  { value: "TRF4", label: "TRF 4ª Região" },
  { value: "TRF5", label: "TRF 5ª Região" },
  { value: "TJSP", label: "TJSP — São Paulo" },
  { value: "TJRJ", label: "TJRJ — Rio de Janeiro" },
  { value: "TJMG", label: "TJMG — Minas Gerais" },
];

const PERIODOS = [
  { value: "", label: "Qualquer período" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Último mês" },
  { value: "90", label: "Últimos 3 meses" },
  { value: "365", label: "Último ano" },
  { value: "1825", label: "Últimos 5 anos" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [tribunal, setTribunal] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({ query: "", tribunal: "", periodo: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ query: query.trim(), tribunal, periodo });
    setSearched(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-7 h-7 text-blue-700" />
            <span className="text-xl font-bold text-slate-900">JurisPro</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-700 transition-colors">Buscar</a>
            <a href="#" className="hover:text-blue-700 transition-colors">Tribunais</a>
            <a href="#" className="hover:text-blue-700 transition-colors">Preços</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
            <button className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Criar conta grátis
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-3 text-sm font-medium text-slate-700">
            <a href="#">Buscar</a>
            <a href="#">Tribunais</a>
            <a href="#">Preços</a>
            <hr className="border-slate-200" />
            <a href="#" className="text-blue-700">Entrar</a>
            <button className="bg-blue-700 text-white px-4 py-2 rounded-lg">Criar conta grátis</button>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero / Search */}
        <section className={`transition-all duration-500 ${searched ? "py-6 bg-white border-b border-slate-200" : "py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {!searched && (
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-blue-700/30 text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Resumos com IA · Dados atualizados diariamente
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                  Jurisprudências atualizadas<br />
                  <span className="text-blue-300">na palma da sua mão</span>
                </h1>
                <p className="text-blue-100 text-lg max-w-xl mx-auto">
                  Busque decisões do STF, STJ e tribunais estaduais com resumos gerados por inteligência artificial.
                </p>
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Ex: dano moral trabalhista, prescrição intercorrente..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
                >
                  Buscar
                </button>
              </div>

              {/* Filters toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${searched ? "text-slate-600 hover:text-blue-700" : "text-blue-200 hover:text-white"}`}
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
                {(tribunal || periodo) && (
                  <button
                    type="button"
                    onClick={() => { setTribunal(""); setPeriodo(""); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={tribunal}
                      onChange={e => setTribunal(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {TRIBUNAIS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={periodo}
                      onChange={e => setPeriodo(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {PERIODOS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Results or Landing */}
        {searched ? (
          <SearchResults
            query={searchParams.query}
            tribunal={searchParams.tribunal}
            periodo={searchParams.periodo}
          />
        ) : (
          <LandingContent />
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 text-sm py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">JurisPro</span>
            <span>· Jurisprudências para advogados</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingContent() {
  const features = [
    {
      icon: <Search className="w-6 h-6 text-blue-700" />,
      title: "Busca Inteligente",
      desc: "Pesquise por tema, número do processo, relator ou palavras-chave com resultados relevantes em segundos.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-blue-700" />,
      title: "Resumos com IA",
      desc: "Cada decisão é resumida automaticamente pela IA, destacando a tese jurídica, o resultado e os fundamentos.",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-blue-700" />,
      title: "Múltiplos Tribunais",
      desc: "STF, STJ, TST, TRFs e tribunais estaduais em uma única plataforma, com dados atualizados diariamente.",
    },
    {
      icon: <Building2 className="w-6 h-6 text-blue-700" />,
      title: "Filtros Avançados",
      desc: "Filtre por tribunal, relator, período, área do direito, tipo de decisão e muito mais.",
    },
  ];

  const stats = [
    { value: "2M+", label: "Decisões indexadas" },
    { value: "20+", label: "Tribunais cobertos" },
    { value: "Diário", label: "Atualização dos dados" },
    { value: "IA", label: "Resumos automáticos" },
  ];

  return (
    <>
      {/* Stats */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-blue-700">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2">
          Tudo que você precisa para pesquisar jurisprudência
        </h2>
        <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
          Desenvolvido especificamente para advogados, promotores, defensores e estudantes de Direito.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-700 py-16 text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Comece a pesquisar gratuitamente
        </h2>
        <p className="text-blue-100 mb-8 max-w-md mx-auto">
          Crie sua conta e tenha acesso a 50 buscas gratuitas por mês, sem cartão de crédito.
        </p>
        <button className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-base shadow-sm">
          Criar conta grátis
        </button>
      </section>
    </>
  );
}
