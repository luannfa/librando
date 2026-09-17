export type SignCategory = 'letra' | 'numero' | 'saudacao' | 'palavra' | 'familia' | 'sentimento';
export type DifficultyLevel = 'iniciante' | 'intermediario' | 'avancado';

export interface SignItem {
  id: string;
  label: string;
  category: SignCategory;
  level: DifficultyLevel;
  description: string;
  handConfig?: string;
  movementExplanation?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'animation';
  examples?: string[];
  isFeatured?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface HostingerConfig {
  host: string;
  database: string;
  username: string;
  password?: string;
  apiEndpoint?: string;
  subdomain?: string;
  lastSyncedAt?: number;
  syncEnabled: boolean;
}

export interface AdminStats {
  total: number;
  letras: number;
  numeros: number;
  saudacoes: number;
  palavras: number;
  videos: number;
}
