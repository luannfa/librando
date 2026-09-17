import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Star } from 'lucide-react';
import { SignItem, AdminStats, SignCategory } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SignCard } from './components/SignCard';
import { SignDetailModal } from './components/SignDetailModal';
import { LibrasAIChat } from './components/LibrasAIChat';
import { AdminPanel } from './components/AdminPanel';
import { HostingerGuideModal } from './components/HostingerGuideModal';
import { LoginModal } from './components/LoginModal';

export const App: React.FC = () => {
  const [signs, setSigns] = useState<SignItem[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    letras: 0,
    numeros: 0,
    saudacoes: 0,
    palavras: 0,
    videos: 0
  });

  const [activeTab, setActiveTab] = useState<'dicionario' | 'duvidas' | 'admin'>('dicionario');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);

  // Modals & Authentication
  const [selectedSign, setSelectedSign] = useState<SignItem | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('librando_is_admin') === 'true';
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isHostingerOpen, setIsHostingerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load signs & stats on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await api.getSigns();
      setSigns(data);
      const st = await api.getStats();
      setStats(st);
    };

    loadData();

    // Subscribe to Real-Time Server-Sent Events (SSE)
    const unsubscribe = api.subscribeToUpdates((event) => {
      if (event.type === 'create' && event.sign) {
        setSigns((prev) => [event.sign!, ...prev.filter(s => s.id !== event.sign!.id)]);
        showToast(`✨ Novo sinal "${event.sign.label}" adicionado e sincronizado em tempo real!`);
      } else if (event.type === 'update' && event.sign) {
        setSigns((prev) => prev.map((s) => (s.id === event.sign!.id ? event.sign! : s)));
        showToast(`🔄 Sinal "${event.sign.label}" atualizado em tempo real!`);
      } else if (event.type === 'delete' && event.sign) {
        setSigns((prev) => prev.filter((s) => s.id !== event.sign!.id));
        showToast(`🗑️ Sinal "${event.sign.label}" removido em tempo real.`);
      }

      // Refresh stats
      api.getStats().then(setStats);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    localStorage.setItem('librando_is_admin', 'true');
    setActiveTab('admin');
    showToast('🔑 Bem-vindo ao Painel Administrativo do Librando!');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('librando_is_admin');
    if (activeTab === 'admin') setActiveTab('dicionario');
    showToast('🔒 Sessão de administrador encerrada.');
  };

  const handleSaveSign = async (signData: Partial<SignItem>, editingId?: string) => {
    if (editingId) {
      const updated = await api.updateSign(editingId, signData);
      setSigns((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      showToast(`Sinal "${updated.label}" atualizado com sucesso!`);
    } else {
      const created = await api.createSign(signData);
      setSigns((prev) => [created, ...prev]);
      showToast(`Sinal "${created.label}" criado e disponível para todos os usuários!`);
    }
    const newStats = await api.getStats();
    setStats(newStats);
  };

  const handleDeleteSign = async (id: string, label: string) => {
    if (window.confirm(`Tem certeza que deseja remover o sinal "${label}"?`)) {
      await api.deleteSign(id);
      setSigns((prev) => prev.filter((s) => s.id !== id));
      showToast(`Sinal "${label}" removido.`);
      const newStats = await api.getStats();
      setStats(newStats);
    }
  };

  // Filtered signs for main dictionary (Category + Search + Destaques)
  const filteredSigns = signs.filter((s) => {
    const matchesSearch =
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.handConfig?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesFeatured = onlyFeatured ? Boolean(s.isFeatured) : true;

    return matchesSearch && matchesCategory && matchesFeatured;
  });

  // Featured signs to display on home page
  const featuredSigns = signs.filter((s) => s.isFeatured);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col font-sans">
      
      {/* Toast Notification for Real-Time Sync Events */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[300] bg-[#071e63] border-2 border-[#F5C400] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-[#F5C400] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogoutClick={handleAdminLogout}
        onOpenNewModal={() => setActiveTab('admin')}
      />

      {/* Hero Header on Home / Dictionary */}
      {activeTab === 'dicionario' && (
        <Hero
          totalSigns={signs.length}
          totalVideos={stats.videos}
          onExploreClick={() => {
            document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: DICTIONARY / HOME */}
        {activeTab === 'dicionario' && (
          <div className="space-y-8" id="catalog-section">
            
            {/* Principais Sinais Mais Utilizados (Home Highlight) */}
            {featuredSigns.length > 0 && !searchQuery && selectedCategory === 'all' && (
              <section className="bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-3xl p-6 border-2 border-[#F5C400]/50 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#F5C400] text-[#071e63] flex items-center justify-center font-black">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0d1a4a]">
                        Principais Sinais Mais Utilizados
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold">
                        Sinais fundamentais selecionados para comunicação inclusiva no dia a dia
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black uppercase text-[#996e00] bg-[#F5C400]/30 px-3 py-1 rounded-full self-start sm:self-auto">
                    {featuredSigns.length} Sinais em Destaque
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {featuredSigns.map((sign) => (
                    <SignCard key={sign.id} sign={sign} onOpenDetails={setSelectedSign} />
                  ))}
                </div>
              </section>
            )}

            {/* Search & Filter Toolbars */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar sinal (ex: Letra A, Número 5, Obrigado, Amigo)..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 outline-none focus:border-[#1a4fd6] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Destaques Filter Button */}
                <button
                  onClick={() => setOnlyFeatured(!onlyFeatured)}
                  className={`px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-1.5 transition-colors whitespace-nowrap ${
                    onlyFeatured
                      ? 'bg-[#F5C400] text-[#071e63] shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Star className={`w-4 h-4 ${onlyFeatured ? 'fill-current' : ''}`} />
                  <span>Apenas Destaques</span>
                </button>
              </div>

              {/* Category Chips Bar */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
                {[
                  { id: 'all', label: 'Todos os Sinais', count: signs.length },
                  { id: 'letra', label: '✋ Alfabeto (A-Z)', count: stats.letras },
                  { id: 'numero', label: '🔢 Números', count: stats.numeros },
                  { id: 'saudacao', label: '🤝 Saudações', count: stats.saudacoes },
                  { id: 'palavra', label: '💬 Palavras', count: stats.palavras },
                  { id: 'familia', label: '👨‍👩‍👧‍👦 Família', count: signs.filter(s => s.category === 'familia').length },
                  { id: 'sentimento', label: '❤️ Sentimentos', count: signs.filter(s => s.category === 'sentimento').length }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-[#0a2b8c] text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <span>
                Mostrando {filteredSigns.length} de {signs.length} sinais encontrados
              </span>
              <span className="text-[#0a2b8c] flex items-center space-x-1">
                <span>Toque na carta para virar e ver a execução</span>
              </span>
            </div>

            {/* Sign Cards Grid */}
            {filteredSigns.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
                <span className="text-5xl block mb-3">🔍</span>
                <h3 className="text-lg font-black text-slate-800">
                  Nenhum sinal encontrado para esta pesquisa
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Tente alterar os filtros de categoria ou clique em "+ Sinal" caso queira cadastrar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredSigns.map((sign) => (
                  <SignCard key={sign.id} sign={sign} onOpenDetails={setSelectedSign} />
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: PEDAGOGICAL AI Q&A */}
        {activeTab === 'duvidas' && (
          <div className="py-4">
            <LibrasAIChat initialSign={selectedSign} />
          </div>
        )}

        {/* VIEW 3: ADMIN PANEL (Contains Hostinger Configuration internally) */}
        {activeTab === 'admin' && (
          <AdminPanel
            signs={signs}
            stats={stats}
            onSaveSign={handleSaveSign}
            onDeleteSign={handleDeleteSign}
            onOpenHostingerModal={() => setIsHostingerOpen(true)}
          />
        )}

      </main>

      {/* Global Modals */}
      {selectedSign && (
        <SignDetailModal
          sign={selectedSign}
          onClose={() => setSelectedSign(null)}
          onAskAI={(sign) => {
            setSelectedSign(null);
            setActiveTab('duvidas');
          }}
        />
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleAdminLogin}
      />

      {/* Hostinger Guide Modal: strictly accessible when opened from Admin Panel */}
      <HostingerGuideModal
        isOpen={isHostingerOpen}
        onClose={() => setIsHostingerOpen(false)}
        signsCount={signs.length}
      />

      {/* Footer */}
      <footer className="bg-[#071e63] text-white border-t-4 border-[#F5C400] mt-16 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-14 bg-gradient-to-br from-[#1a4fd6] to-[#071e63] border-2 border-[#F5C400] rounded-b-xl flex flex-col items-center justify-center p-1 shadow-md">
              <span className="text-[9px] font-black text-[#F5C400]">ASN</span>
              <span className="text-base">🤟</span>
              <span className="text-[7px] text-white/80 font-bold">ES</span>
            </div>
            <div>
              <div className="text-xl font-black">
                <span>Libra</span><span className="text-[#F5C400]">ndo</span>
              </div>
              <p className="text-xs text-white/70">
                EEEFM Antonio dos Santos Neves • Projeto Escola do Futuro
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-xs text-white/70 space-y-1">
            <p className="font-semibold text-white">
              Dicionário Inclusivo & Guia Prático de Libras
            </p>
            <p>
              Promovendo inclusão, acessibilidade e comunicação para toda a comunidade escolar.
            </p>
            <div className="pt-2 flex items-center justify-center md:justify-end space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-400 font-bold">Sincronização Ativa</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
