import React, { useState } from 'react';
import { BookOpen, HelpCircle, Shield, Settings, LogOut, Plus, Globe, Menu, X, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dicionario' | 'duvidas' | 'admin';
  setActiveTab: (tab: 'dicionario' | 'duvidas' | 'admin') => void;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onOpenNewModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  onLoginClick,
  onLogoutClick,
  onOpenNewModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-[#071e63] via-[#0a2b8c] to-[#1a3da8] text-white border-b-4 border-[#F5C400] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Brand with ASN & Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dicionario')}>
            {/* ASN Crest Shield Icon */}
            <div className="w-12 h-14 bg-gradient-to-br from-[#1a4fd6] to-[#071e63] border-2 border-[#F5C400] rounded-b-xl flex flex-col items-center justify-center p-1 shadow-md transform hover:scale-105 transition-transform">
              <span className="text-[9px] font-black text-[#F5C400] tracking-tighter">ASN</span>
              <span className="text-sm">🤟</span>
              <span className="text-[7px] text-white/80 font-bold">ES</span>
            </div>

            <div className="flex flex-col">
              <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
                <span className="text-white">Libra</span>
                <span className="text-[#F5C400] drop-shadow-[0_2px_8px_rgba(245,196,0,0.5)]">ndo</span>
              </div>
              <span className="text-xs text-white/70 font-bold tracking-wide mt-1">
                Dicionário & Guia de Libras
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              id="nav-tab-dicionario"
              onClick={() => setActiveTab('dicionario')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full font-extrabold text-sm transition-all ${
                activeTab === 'dicionario'
                  ? 'bg-[#F5C400] text-[#071e63] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Dicionário</span>
            </button>

            <button
              id="nav-tab-duvidas"
              onClick={() => setActiveTab('duvidas')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full font-extrabold text-sm transition-all ${
                activeTab === 'duvidas'
                  ? 'bg-[#F5C400] text-[#071e63] shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Tirar Dúvidas</span>
            </button>

            {isAdmin && (
              <>
                <button
                  id="nav-tab-admin"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-full font-extrabold text-sm transition-all ${
                    activeTab === 'admin'
                      ? 'bg-[#F5C400] text-[#071e63] shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Painel Admin</span>
                </button>

                <button
                  id="nav-btn-new-sign"
                  onClick={onOpenNewModal}
                  className="flex items-center space-x-1 px-3.5 py-2 rounded-full text-xs font-black bg-[#e91e8c] hover:bg-[#c4186e] text-white shadow-md transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Sinal</span>
                </button>
              </>
            )}
          </div>

          {/* User & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAdmin ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white/70 bg-black/20 px-2.5 py-1 rounded-full border border-white/10">
                  👤 admin
                </span>
                <button
                  id="nav-btn-logout"
                  onClick={onLogoutClick}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold border border-white/20 hover:bg-white/10 text-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <button
                id="nav-btn-login"
                onClick={onLoginClick}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full font-black text-sm bg-[#F5C400] hover:bg-[#ffd633] text-[#071e63] shadow-md transition-all transform active:scale-95"
              >
                <Shield className="w-4 h-4" />
                <span>Painel Escolar</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center space-x-2">
            {!isAdmin && (
              <button
                onClick={onLoginClick}
                className="px-3 py-1.5 rounded-full text-xs font-black bg-[#F5C400] text-[#071e63]"
              >
                Admin
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/10 text-white"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#071e63] border-t border-white/10 px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => { setActiveTab('dicionario'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-bold text-sm ${activeTab === 'dicionario' ? 'bg-[#F5C400] text-[#071e63]' : 'text-white'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Dicionário Completo</span>
          </button>

          <button
            onClick={() => { setActiveTab('duvidas'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-bold text-sm ${activeTab === 'duvidas' ? 'bg-[#F5C400] text-[#071e63]' : 'text-white'}`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Esclarecer Dúvidas (IA)</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-bold text-sm ${activeTab === 'admin' ? 'bg-[#F5C400] text-[#071e63]' : 'text-white'}`}
              >
                <Settings className="w-4 h-4" />
                <span>Painel Administrativo</span>
              </button>

              <button
                onClick={() => { onOpenNewModal(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-black text-sm bg-[#e91e8c] text-white shadow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Adicionar Novo Sinal</span>
              </button>

              <button
                onClick={() => { onLogoutClick(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs text-red-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair do Painel</span>
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
