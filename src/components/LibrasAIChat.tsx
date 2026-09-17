import React, { useState } from 'react';
import { Sparkles, Send, HelpCircle, BookOpen, Lightbulb } from 'lucide-react';
import { api } from '../services/api';
import { SignItem } from '../types';

interface LibrasAIChatProps {
  initialSign?: SignItem | null;
}

export const LibrasAIChat: React.FC<LibrasAIChatProps> = ({ initialSign }) => {
  const [question, setQuestion] = useState(
    initialSign ? `Como executar o sinal de "${initialSign.label}" com perfeição?` : ''
  );
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Olá! Sou o Tutor Virtual de Libras da Escola ASN. Você pode me perguntar sobre como fazer qualquer sinal, configurações de mão (CM), pontos de articulação (PA), gramática visual ou dúvidas do dia a dia!'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    'Como fazer o sinal de "Obrigado"?',
    'Qual a diferença de configuração de mão entre A e S?',
    'Como funciona a expressão facial na gramática de Libras?',
    'Dicas para memorizar o alfabeto dactilológico rápido',
    'Como dizer "Bom dia, professor" em Libras?'
  ];

  const handleSend = async (qText?: string) => {
    const textToSend = qText || question.trim();
    if (!textToSend || loading) return;

    const userMsg = { role: 'user' as const, text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const answer = await api.askAI(textToSend, initialSign?.label);
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Dica pedagógica: em Libras, atente-se sempre à Configuração de Mão, Ponto de Articulação, Movimento, Orientação e Expressão Facial.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col h-[600px]">
      
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[#071e63] via-[#0a2b8c] to-[#1a3da8] text-white p-5 flex items-center justify-between border-b-4 border-[#F5C400]">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F5C400] text-[#071e63] flex items-center justify-center font-black text-2xl shadow">
            🤟
          </div>
          <div>
            <h2 className="text-lg font-black flex items-center space-x-1.5">
              <span>Tutor Pedagógico de Libras</span>
              <Sparkles className="w-4 h-4 text-[#F5C400]" />
            </h2>
            <p className="text-xs text-white/70 font-semibold">
              Esclareça dúvidas sobre movimentos, parâmetros e significados
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Chips */}
      <div className="bg-slate-50 p-3 border-b border-slate-200/60 overflow-x-auto">
        <span className="text-[11px] font-black uppercase text-slate-400 block mb-1.5 flex items-center space-x-1">
          <Lightbulb className="w-3 h-3 text-[#F5C400]" />
          <span>Dúvidas Frequentes:</span>
        </span>
        <div className="flex space-x-2">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs font-bold whitespace-nowrap bg-white hover:bg-indigo-50 text-indigo-900 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm font-medium leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0a2b8c] text-white rounded-br-none shadow-md'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60 whitespace-pre-line'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-none p-3.5 text-xs font-bold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#1a4fd6] animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-[#F5C400] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#e91e8c] animate-bounce [animation-delay:0.4s]"></span>
              <span>Consultando parâmetros de Libras...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: Como fazer o sinal de Família? Qual a configuração de mão?"
            className="flex-1 p-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#0a2b8c]"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="px-5 py-3 rounded-2xl bg-[#F5C400] hover:bg-[#ffd633] text-[#071e63] font-black text-sm shadow transition-all disabled:opacity-50 flex items-center space-x-1"
          >
            <span>Enviar</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
