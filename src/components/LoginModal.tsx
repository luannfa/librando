import React, { useState } from 'react';
import { X, Shield, Lock, User, AlertCircle, Award } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && (password === 'Admin@2026' || password === 'admin' || password === '123456')) {
      setError('');
      onSuccess();
      onClose();
    } else {
      setError('Credenciais incorretas. Use o usuário "admin" e senha "Admin@2026".');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[#071e63]/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl relative my-auto border border-slate-100 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot & Shield */}
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#0a2b8c] to-[#1a4fd6] text-white flex items-center justify-center shadow-xl border-4 border-[#F5C400] mb-3">
          <span className="text-3xl">🤟</span>
        </div>

        <h2 className="text-xl font-black text-[#0d1a4a]">
          Painel Administrativo
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-0.5 mb-5">
          Acesso restrito • Escola ASN & Gestores de Libras
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-2.5 rounded-xl flex items-center space-x-2 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          <div>
            <label className="block text-xs font-black uppercase text-slate-600 mb-1">
              Usuário
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#0a2b8c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-600 mb-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#0a2b8c]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1a4fd6] to-[#0a2b8c] hover:brightness-110 text-white font-black text-sm shadow-md transition-all"
            >
              Entrar no Painel
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-2">
            Dica para teste: usuário <strong>admin</strong> e senha <strong>Admin@2026</strong>
          </div>
        </form>

      </div>
    </div>
  );
};
