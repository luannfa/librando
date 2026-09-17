import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Video, Image, Play, UploadCloud, Globe, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { SignItem, AdminStats, SignCategory, DifficultyLevel } from '../types';

interface AdminPanelProps {
  signs: SignItem[];
  stats: AdminStats;
  onSaveSign: (signData: Partial<SignItem>, editingId?: string) => Promise<void>;
  onDeleteSign: (id: string, label: string) => Promise<void>;
  onOpenHostingerModal: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  signs,
  stats,
  onSaveSign,
  onDeleteSign,
  onOpenHostingerModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<SignCategory>('letra');
  const [level, setLevel] = useState<DifficultyLevel>('iniciante');
  const [description, setDescription] = useState('');
  const [handConfig, setHandConfig] = useState('');
  const [movementExplanation, setMovementExplanation] = useState('');
  const [examplesInput, setExamplesInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenAdd = () => {
    setEditingId(null);
    setLabel('');
    setCategory('letra');
    setLevel('iniciante');
    setDescription('');
    setHandConfig('');
    setMovementExplanation('');
    setExamplesInput('');
    setIsFeatured(false);
    setMediaUrl('');
    setMediaType('image');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sign: SignItem) => {
    setEditingId(sign.id);
    setLabel(sign.label);
    setCategory(sign.category);
    setLevel(sign.level);
    setDescription(sign.description);
    setHandConfig(sign.handConfig || '');
    setMovementExplanation(sign.movementExplanation || '');
    setExamplesInput(sign.examples?.join(', ') || '');
    setIsFeatured(Boolean(sign.isFeatured));
    setMediaUrl(sign.mediaUrl || '');
    setMediaType(sign.mediaType === 'video' ? 'video' : 'image');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 60 * 1024 * 1024) {
      setFormError('Arquivo muito pesado. O limite máximo é de 60 MB.');
      return;
    }

    const isVideo = file.type.startsWith('video');
    const isImage = file.type.startsWith('image');

    if (!isVideo && !isImage) {
      setFormError('Por favor selecione um arquivo de vídeo (MP4, WebM) ou imagem (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setMediaUrl(dataUrl);
      setMediaType(isVideo ? 'video' : 'image');
      setFormError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setFormError('Informe o título/rótulo do sinal (ex: Letra A, Número 1, Obrigado).');
      return;
    }
    if (!description.trim()) {
      setFormError('Forneça a descrição de como realizar o movimento do sinal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const examples = examplesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await onSaveSign(
        {
          label: label.trim(),
          category,
          level,
          description: description.trim(),
          handConfig: handConfig.trim(),
          movementExplanation: movementExplanation.trim(),
          mediaUrl,
          mediaType,
          examples,
          isFeatured
        },
        editingId || undefined
      );

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar o sinal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSigns = signs.filter((s) => {
    const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
    const matchSearch =
      s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-[#071e63] via-[#0a2b8c] to-[#1a3da8] text-white rounded-3xl p-6 sm:p-8 shadow-xl border-b-4 border-[#F5C400]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black uppercase text-[#F5C400] tracking-widest mb-1">
              <span>Painel Administrativo Escolar</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5C400]"></span>
              <span className="text-emerald-400">Tempo Real Ativo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Gerenciar Conteúdo & Sinais de Libras
            </h1>
            <p className="text-xs sm:text-sm text-white/70 font-semibold mt-1">
              Adicione vídeos, imagens e descrições educativas. O conteúdo fica disponível instantaneamente para todos os alunos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenHostingerModal}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full transition-all"
            >
              <Globe className="w-4 h-4 text-[#F5C400]" />
              <span>Configurar Hostinger</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-2 bg-[#F5C400] hover:bg-[#ffd633] text-[#071e63] text-xs sm:text-sm font-black px-5 py-2.5 rounded-full shadow-lg transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Adicionar Novo Sinal</span>
            </button>
          </div>
        </div>

        {/* Real-time sync badge */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold">Sincronização em tempo real ativa (Server-Sent Events)</span>
          </span>
          <span className="text-white/60">Banco Local + Suporte MySQL Hostinger</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border-t-4 border-[#0a2b8c] text-center">
          <div className="text-2xl sm:text-3xl font-black text-[#0a2b8c]">{stats.total}</div>
          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Total de Sinais</div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border-t-4 border-[#1a4fd6] text-center">
          <div className="text-2xl sm:text-3xl font-black text-[#1a4fd6]">{stats.letras}</div>
          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Letras (Alfabeto)</div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border-t-4 border-[#F5C400] text-center">
          <div className="text-2xl sm:text-3xl font-black text-[#996e00]">{stats.numeros}</div>
          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Números</div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border-t-4 border-[#27ae60] text-center">
          <div className="text-2xl sm:text-3xl font-black text-[#27ae60]">{stats.saudacoes}</div>
          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Saudações</div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border-t-4 border-[#e91e8c] text-center">
          <div className="text-2xl sm:text-3xl font-black text-[#e91e8c]">{stats.palavras}</div>
          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Palavras</div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border-t-4 border-indigo-600 text-center">
          <div className="text-2xl sm:text-3xl font-black text-indigo-600">{stats.videos}</div>
          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Vídeos Ativos</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar sinal no painel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#1a4fd6]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'letra', label: 'Letras' },
            { id: 'numero', label: 'Números' },
            { id: 'saudacao', label: 'Saudações' },
            { id: 'palavra', label: 'Palavras' },
            { id: 'familia', label: 'Família' },
            { id: 'sentimento', label: 'Sentimentos' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-[#0a2b8c] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Signs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#071e63] text-white text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-4">Mídia</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Rótulo / Título</th>
                <th className="py-3 px-4">Descrição de Movimento</th>
                <th className="py-3 px-4 text-center">Destaque</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {filteredSigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    Nenhum sinal encontrado. Clique em "+ Adicionar Novo Sinal" para cadastrar.
                  </td>
                </tr>
              ) : (
                filteredSigns.map((sign) => (
                  <tr key={sign.id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="py-3 px-4">
                      {sign.mediaUrl ? (
                        sign.mediaType === 'video' ? (
                          <div className="w-14 h-10 rounded-lg bg-black/90 flex items-center justify-center text-white relative overflow-hidden">
                            <video src={sign.mediaUrl} muted className="w-full h-full object-cover" />
                            <Play className="w-3 h-3 absolute" />
                          </div>
                        ) : (
                          <img src={sign.mediaUrl} alt={sign.label} className="w-14 h-10 rounded-lg object-cover" />
                        )
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs">
                          🤟
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase font-black text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-100">
                        {sign.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-[#0d1a4a] text-sm">
                      {sign.label}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-500">
                      {sign.description}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {sign.isFeatured ? (
                        <span className="inline-block text-[10px] font-black bg-[#F5C400] text-[#071e63] px-2 py-0.5 rounded-full">
                          ⭐ Sim
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(sign)}
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-[#1a4fd6] text-[#1a4fd6] hover:text-white transition-colors"
                          title="Editar Sinal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSign(sign.id, sign.label)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors"
                          title="Excluir Sinal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#071e63]/80 backdrop-blur-sm z-[220] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative my-auto border border-slate-100">
            <h2 className="text-2xl font-black text-[#0d1a4a] mb-1">
              {editingId ? '✏️ Editar Carta de Sinal' : '✨ Nova Carta de Sinal'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Preencha os detalhes e insira o vídeo ou imagem demonstrativa do gesto em Libras.
            </p>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                  Categoria do Sinal
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SignCategory)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="letra">✋ Letra (Alfabeto)</option>
                  <option value="numero">🔢 Número</option>
                  <option value="saudacao">🤝 Saudação / Cumprimento</option>
                  <option value="palavra">💬 Palavra / Vocabulário</option>
                  <option value="familia">👨‍👩‍👧‍👦 Família & Relações</option>
                  <option value="sentimento">❤️ Sentimento & Emoção</option>
                </select>
              </div>

              {/* Title / Label */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                  Título / O que é o sinal (Ex: Letra A, Número 1, Obrigado) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Letra A"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                  Descrição e Significado do Sinal *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explique o que o sinal representa e o significado..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Movement & Hand Config */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                    Configuração de Mão (CM)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mão fechada com polegar para fora"
                    value={handConfig}
                    onChange={(e) => setHandConfig(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                    Movimento Específico
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Movimento circular no espaço neutro"
                    value={movementExplanation}
                    onChange={(e) => setMovementExplanation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Media Upload Area */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                  Vídeo Demonstrativo ou Imagem do Sinal
                </label>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 rounded-2xl p-4 text-center cursor-pointer transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="video/*,image/*"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                  <UploadCloud className="w-8 h-8 mx-auto text-indigo-500 mb-1" />
                  <span className="text-xs font-bold text-indigo-900 block">
                    Clique para selecionar Vídeo (MP4/WebM) ou Foto (PNG/JPG)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Máximo 60 MB • Pré-visualização instantânea
                  </span>
                </div>

                {/* Media Preview if available */}
                {mediaUrl && (
                  <div className="mt-3 relative rounded-xl overflow-hidden bg-black p-2 border border-slate-200">
                    <div className="max-h-48 flex items-center justify-center">
                      {mediaType === 'video' ? (
                        <video src={mediaUrl} controls className="max-h-44 rounded-lg" />
                      ) : (
                        <img src={mediaUrl} alt="Preview" className="max-h-44 object-contain rounded-lg" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="mt-2 text-xs font-bold text-red-500 hover:text-red-700 block text-center w-full"
                    >
                      Remover Mídia
                    </button>
                  </div>
                )}
              </div>

              {/* Context examples & Featured */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                    Exemplos de Uso (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Alfabeto dactilológico, Nome próprio, Início de frase"
                    value={examplesInput}
                    onChange={(e) => setExamplesInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#0a2b8c] focus:ring-[#F5C400]"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Destacar este sinal na página inicial (Principais Sinais)
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#F5C400] hover:bg-[#ffd633] text-[#071e63] text-xs font-black shadow transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Gravando...' : 'Salvar Sinal'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
