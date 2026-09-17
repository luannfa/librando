import React, { useState, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { SignItem } from '../types';
import { api } from '../services/api';

interface SignDetailModalProps {
  sign: SignItem | null;
  onClose: () => void;
  onAskAI: (sign: SignItem) => void;
}

export const SignDetailModal: React.FC<SignDetailModalProps> = ({
  sign,
  onClose,
  onAskAI
}) => {
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!sign) return null;

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleAskQuickAI = async () => {
    setLoadingAi(true);
    try {
      const response = await api.askAI(`Explique de forma detalhada como um iniciante deve praticar e memorizar o sinal de "${sign.label}" em Libras, citando os parâmetros CM e PA.`);
      setAiTip(response);
    } catch {
      setAiTip('Dica pedagógica: pratique o sinal diante de um espelho prestando atenção à orientação da palma e ao ritmo do movimento.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[#071e63]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative my-auto max-h-[90vh] flex flex-col border border-indigo-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview Section */}
        <div className="relative bg-slate-950 w-full h-[240px] sm:h-[280px] flex items-center justify-center overflow-hidden">
          {sign.mediaUrl ? (
            sign.mediaType === 'video' ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={sign.mediaUrl}
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Video Playback Speed Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white">
                  <button
                    onClick={handleTogglePlay}
                    className="flex items-center space-x-1 hover:text-[#F5C400] font-bold"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-white/60 uppercase font-bold">Câmera Lenta:</span>
                    {[0.5, 0.75, 1].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-colors ${
                          playbackRate === speed ? 'bg-[#F5C400] text-[#071e63]' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={sign.mediaUrl}
                alt={sign.label}
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <div className="text-center text-white/50 p-6 flex flex-col items-center">
              <span className="text-5xl mb-2">🤟</span>
              <span className="text-sm font-bold">Sem vídeo gravado</span>
            </div>
          )}
        </div>

        {/* Details Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Header Title & Badges */}
          <div className="flex items-start justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {sign.category}
                </span>
                {sign.isFeatured && (
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#fff8d0] text-[#996e00]">
                    ⭐ Destaque
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-black text-[#0d1a4a] mt-1">
                {sign.label}
              </h2>
            </div>

            <button
              onClick={() => onAskAI(sign)}
              className="flex items-center space-x-1 text-xs font-bold bg-[#F5C400] hover:bg-[#ffd633] text-[#071e63] px-3 py-1.5 rounded-full shadow transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tirar Dúvida Pedagógica</span>
            </button>
          </div>

          {/* Meaning & Instruction */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">
              Significado & Descrição
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {sign.description}
            </p>
          </div>

          {/* Technical Libras Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[11px] font-black uppercase text-indigo-900 block mb-0.5">
                🖐️ Configuração de Mão (CM)
              </span>
              <p className="text-xs text-slate-600">
                {sign.handConfig || 'Formato específico das mãos e dedos para execução deste sinal.'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase text-indigo-900 block mb-0.5">
                🔄 Movimento & Articulação
              </span>
              <p className="text-xs text-slate-600">
                {sign.movementExplanation || 'Localização no espaço neutro ou toque com movimento fluido.'}
              </p>
            </div>
          </div>

          {/* Contextual Examples */}
          {sign.examples && sign.examples.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1.5">
                Exemplos de Aplicação Prática
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {sign.examples.map((ex, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 text-xs font-bold bg-indigo-50 text-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-100/80"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{ex}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interactive AI Tutor Section */}
          <div className="pt-2">
            {!aiTip ? (
              <button
                onClick={handleAskQuickAI}
                disabled={loadingAi}
                className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 text-xs font-bold text-indigo-900 hover:bg-indigo-50 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5C400]" />
                <span>{loadingAi ? 'Consultando Tutor em Libras...' : '💡 Ver Dica Didática com Inteligência Artificial'}</span>
              </button>
            ) : (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950">
                <span className="font-black flex items-center space-x-1 text-amber-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#e91e8c]" />
                  <span>Dica do Tutor Virtual:</span>
                </span>
                <p className="leading-relaxed font-medium whitespace-pre-line">{aiTip}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
