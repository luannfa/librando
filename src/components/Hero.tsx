import React from 'react';
import { Award, Heart, Sparkles, Video, BookOpen } from 'lucide-react';

interface HeroProps {
  totalSigns: number;
  totalVideos: number;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  totalSigns,
  totalVideos,
  onExploreClick
}) => {
  return (
    <div className="relative bg-gradient-to-br from-[#071e63] via-[#0a2b8c] to-[#1a4fd6] text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-md">
      {/* Subtle radial glow background overlay */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(245,196,0,0.3) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(233,30,140,0.25) 0%, transparent 50%)'
        }}
      />

      <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Top Badges & ES State Flag */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-extrabold text-white">
            <span className="flex space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1a4fd6]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#e91e8c]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
            </span>
            <span>Espírito Santo • EEEFM Antonio dos Santos Neves</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#F5C400] text-[#071e63] px-3 py-1 rounded-full text-xs font-black shadow-sm">
            <Award className="w-3.5 h-3.5" />
            <span>Certificação Escola do Futuro</span>
          </div>
        </div>

        {/* Mascot & Hero Title */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-3">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#F5C400] to-[#ffd633] p-1.5 shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-[#071e63] flex flex-col items-center justify-center border-2 border-white/30">
                <span className="text-4xl sm:text-5xl">🤟</span>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#e91e8c] text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white">
              LIBRAS
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            <span>Guia Inclusivo </span>
            <span className="text-[#F5C400] drop-shadow-[0_4px_16px_rgba(245,196,0,0.4)]">Librando</span>
          </h1>

          <p className="mt-3 text-base sm:text-xl text-white/85 max-w-2xl font-semibold leading-relaxed">
            Dicionário interativo de Libras com significado, descrição passo a passo do movimento e vídeos demonstrativos para aprender com facilidade.
          </p>
        </div>

        {/* Category & Inclusion Highlights */}
        <div className="flex flex-wrap justify-center gap-2 mt-2 mb-8">
          <span className="bg-white/10 border border-white/20 rounded-full px-3.5 py-1 text-xs font-bold text-white flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-[#F5C400]" />
            <span>Alfabeto & Números</span>
          </span>
          <span className="bg-white/10 border border-white/20 rounded-full px-3.5 py-1 text-xs font-bold text-white flex items-center space-x-1.5">
            <Heart className="w-3 h-3 text-[#e91e8c]" />
            <span>Educação Inclusiva</span>
          </span>
          <span className="bg-white/10 border border-white/20 rounded-full px-3.5 py-1 text-xs font-bold text-white flex items-center space-x-1.5">
            <Video className="w-3 h-3 text-[#58a6ff]" />
            <span>{totalVideos} Vídeos Demonstrativos</span>
          </span>
          <span className="bg-[#e91e8c] text-white rounded-full px-3.5 py-1 text-xs font-black shadow-sm">
            Sincronização em Tempo Real
          </span>
        </div>

        {/* Action Buttons & Counters */}
        <div className="flex items-center justify-center">
          <button
            onClick={onExploreClick}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-full font-black text-sm sm:text-base bg-[#F5C400] hover:bg-[#ffd633] text-[#071e63] shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <BookOpen className="w-5 h-5" />
            <span>Explorar Dicionário ({totalSigns} Sinais)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
