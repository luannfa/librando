import React, { useState } from 'react';
import { Play, Info, Video, Sparkles } from 'lucide-react';
import { SignItem, SignCategory, DifficultyLevel } from '../types';

interface SignCardProps {
  sign: SignItem;
  onOpenDetails: (sign: SignItem) => void;
}

export const SignCard: React.FC<SignCardProps> = ({ sign, onOpenDetails }) => {
  const [flipped, setFlipped] = useState(false);

  // Category badges styling
  const getCategoryStyles = (category: SignCategory) => {
    switch (category) {
      case 'letra':
        return {
          label: 'Letra',
          badge: 'bg-[#dce8ff] text-[#1a4fd6] border-[#1a4fd6]/30',
          topBorder: 'border-t-[#1a4fd6]'
        };
      case 'numero':
        return {
          label: 'Número',
          badge: 'bg-[#fff8d0] text-[#996e00] border-[#F5C400]/40',
          topBorder: 'border-t-[#F5C400]'
        };
      case 'saudacao':
        return {
          label: 'Saudação',
          badge: 'bg-[#e2f8e9] text-[#1e8449] border-[#27ae60]/40',
          topBorder: 'border-t-[#27ae60]'
        };
      case 'familia':
        return {
          label: 'Família',
          badge: 'bg-[#f0e6ff] text-[#6b21a8] border-[#8b5cf6]/40',
          topBorder: 'border-t-[#8b5cf6]'
        };
      case 'sentimento':
        return {
          label: 'Sentimento',
          badge: 'bg-[#fee2e2] text-[#991b1b] border-[#ef4444]/40',
          topBorder: 'border-t-[#ef4444]'
        };
      case 'palavra':
      default:
        return {
          label: 'Palavra',
          badge: 'bg-[#ffe0f2] text-[#c4186e] border-[#e91e8c]/30',
          topBorder: 'border-t-[#e91e8c]'
        };
    }
  };

  const cat = getCategoryStyles(sign.category);

  return (
    <div className="group h-[230px] sm:h-[250px] [perspective:1000px] select-none">
      <div
        onClick={() => setFlipped(!flipped)}
        className={`relative w-full h-full duration-500 [transform-style:preserve-3d] cursor-pointer rounded-2xl shadow-[0_6px_20px_rgba(10,43,140,0.12)] transition-transform ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* FRONT SIDE */}
        <div
          className={`absolute inset-0 w-full h-full bg-white rounded-2xl [backface-visibility:hidden] p-4 flex flex-col justify-between items-center text-center border-t-[6px] ${cat.topBorder} border-x border-b border-slate-100 hover:shadow-xl transition-shadow`}
        >
          {/* Badges */}
          <div className="w-full flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cat.badge}`}>
              {cat.label}
            </span>
            {sign.isFeatured && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#fff8d0] text-[#996e00]">
                ⭐ Destaque
              </span>
            )}
          </div>

          {/* Center Label */}
          <div className="my-auto px-2">
            <div className={`font-black text-[#0d1a4a] leading-none mb-1.5 ${
              sign.label.length <= 2 ? 'text-5xl sm:text-6xl' : sign.label.length <= 8 ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}>
              {sign.label}
            </div>

            {sign.description && (
              <p className="text-xs text-slate-500 line-clamp-2 leading-tight px-1">
                {sign.description}
              </p>
            )}
          </div>

          {/* Bottom Flip Hint */}
          <div className="w-full flex items-center justify-center space-x-1 text-[11px] font-bold text-indigo-900/60 bg-indigo-50/60 py-1 rounded-lg">
            <span>Toque para ver o sinal</span>
            <span className="text-sm">🔄</span>
          </div>
        </div>

        {/* BACK SIDE (Demonstration Media) */}
        <div
          className="absolute inset-0 w-full h-full bg-[#071e63] rounded-2xl [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden flex flex-col items-center justify-center relative shadow-xl"
        >
          {sign.mediaUrl ? (
            sign.mediaType === 'video' ? (
              <div className="relative w-full h-full">
                <video
                  src={sign.mediaUrl}
                  muted
                  loop
                  playsInline
                  autoPlay={flipped}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                  <span className="w-10 h-10 rounded-full bg-[#F5C400]/90 text-[#071e63] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </span>
                </div>
              </div>
            ) : (
              <img
                src={sign.mediaUrl}
                alt={sign.label}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="p-4 text-center text-white/60 flex flex-col items-center justify-center space-y-2">
              <span className="text-4xl">🤟</span>
              <span className="text-xs font-bold text-white/80">Visualização de Sinal</span>
              <p className="text-[11px] text-white/60 line-clamp-2">{sign.description}</p>
            </div>
          )}

          {/* Bottom Overlay with Label and Info Button */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071e63] via-[#071e63]/90 to-transparent p-3 pt-6 flex items-center justify-between">
            <span className="text-sm font-black text-white truncate pr-2">
              {sign.label}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(sign);
              }}
              className="flex items-center space-x-1 bg-[#F5C400] text-[#071e63] hover:bg-white text-[11px] font-black px-2.5 py-1 rounded-full shadow transition-colors"
              title="Abrir detalhes e explicação completa"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Ver Detalhes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
