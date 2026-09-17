import { SignItem, AdminStats, HostingerConfig } from '../types';
import { INITIAL_SIGNS } from '../data/initialSigns';

const LOCAL_STORAGE_KEY = 'librando_cards_cache';

// Helper to determine the correct API base URL
// Works seamlessly in root domain, Hostinger subdomains, or subdirectories like /librando/
function getApiUrl(path: string): string {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    // Extract current directory path (e.g. "/" or "/librando/")
    const basePath = pathname.endsWith('/')
      ? pathname
      : pathname.substring(0, pathname.lastIndexOf('/') + 1);

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${basePath}${cleanPath}`.replace(/\/+/g, '/');
  }
  return path;
}

export const api = {
  async getSigns(): Promise<SignItem[]> {
    try {
      const res = await fetch(getApiUrl('/api/signs'));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.data));
          return data.data;
        }
      }
    } catch (e) {
      console.warn('Backend /api/signs indisponível, usando cache local:', e);
    }

    // Local fallback
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return INITIAL_SIGNS;
  },

  async createSign(sign: Partial<SignItem>): Promise<SignItem> {
    try {
      const res = await fetch(getApiUrl('/api/signs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sign)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Erro ao salvar no servidor, salvando localmente:', e);
    }

    // Local fallback
    const current = await this.getSigns();
    const newSign: SignItem = {
      id: `sinal-${Date.now()}`,
      label: sign.label || 'Novo Sinal',
      category: sign.category || 'palavra',
      level: sign.level || 'iniciante',
      description: sign.description || '',
      handConfig: sign.handConfig || '',
      movementExplanation: sign.movementExplanation || '',
      mediaUrl: sign.mediaUrl || '',
      mediaType: sign.mediaType || 'image',
      examples: sign.examples || [],
      isFeatured: Boolean(sign.isFeatured),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = [newSign, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return newSign;
  },

  async updateSign(id: string, sign: Partial<SignItem>): Promise<SignItem> {
    try {
      const res = await fetch(getApiUrl(`/api/signs/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sign, id })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Erro ao atualizar no servidor, atualizando localmente:', e);
    }

    // Local fallback
    const current = await this.getSigns();
    const index = current.findIndex(s => s.id === id);
    if (index !== -1) {
      current[index] = {
        ...current[index],
        ...sign,
        updatedAt: Date.now()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
      return current[index];
    }
    throw new Error('Sinal não encontrado');
  },

  async deleteSign(id: string): Promise<void> {
    try {
      const res = await fetch(getApiUrl(`/api/signs/${id}?id=${id}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('Erro ao deletar no servidor:', e);
    }

    const current = await this.getSigns();
    const filtered = current.filter(s => s.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  },

  async getStats(): Promise<AdminStats> {
    try {
      const res = await fetch(getApiUrl('/api/stats'));
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // ignore
    }
    const signs = await this.getSigns();
    return {
      total: signs.length,
      letras: signs.filter(s => s.category === 'letra').length,
      numeros: signs.filter(s => s.category === 'numero').length,
      saudacoes: signs.filter(s => s.category === 'saudacao').length,
      palavras: signs.filter(s => s.category === 'palavra').length,
      videos: signs.filter(s => s.mediaType === 'video').length
    };
  },

  // Connect real-time Server-Sent Events
  subscribeToUpdates(onUpdate: (event: { type: string; sign?: SignItem }) => void): () => void {
    if (typeof EventSource === 'undefined') return () => {};

    try {
      const source = new EventSource(getApiUrl('/api/signs/stream'));
      source.addEventListener('signs-update', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          onUpdate(parsed);
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      });

      return () => {
        source.close();
      };
    } catch (err) {
      console.warn('Could not establish SSE connection:', err);
      return () => {};
    }
  },

  async syncHostinger(config: HostingerConfig): Promise<{ success: boolean; message: string; sql?: string }> {
    try {
      const res = await fetch(getApiUrl('/api/hostinger-sync'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Falha ao conectar com serviço de sincronização: ' + err.message };
    }
  },

  async askAI(question: string, signLabel?: string): Promise<string> {
    try {
      const res = await fetch(getApiUrl('/api/gemini/explain'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, signLabel })
      });
      const data = await res.json();
      return data.answer || 'Sem resposta disponível.';
    } catch (err: any) {
      return 'Dica pedagógica: em Libras, atente-se à Configuração de Mão, Ponto de Articulação, Movimento, Orientação e Expressão Facial.';
    }
  }
};
