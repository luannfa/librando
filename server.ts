import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SIGNS } from './src/data/initialSigns';
import { SignItem } from './src/types';

const rootDir = process.cwd();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image/video uploads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const signsFilePath = path.join(dataDir, 'signs.json');

// Initialize database file with initial signs if missing or empty
function readSignsFromDisk(): SignItem[] {
  try {
    if (fs.existsSync(signsFilePath)) {
      const raw = fs.readFileSync(signsFilePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Write defaults
    fs.writeFileSync(signsFilePath, JSON.stringify(INITIAL_SIGNS, null, 2));
    return INITIAL_SIGNS;
  } catch (err) {
    console.error('Error reading signs.json:', err);
    return INITIAL_SIGNS;
  }
}

function writeSignsToDisk(signs: SignItem[]) {
  try {
    fs.writeFileSync(signsFilePath, JSON.stringify(signs, null, 2));
  } catch (err) {
    console.error('Error writing signs.json:', err);
  }
}

// Memory cache
let signsMemory: SignItem[] = readSignsFromDisk();

// Real-Time Server-Sent Events (SSE) clients
const sseClients = new Set<Response>();

function broadcastUpdate(type: 'create' | 'update' | 'delete', sign?: SignItem) {
  const payload = JSON.stringify({
    type,
    sign,
    total: signsMemory.length,
    timestamp: Date.now()
  });

  for (const client of sseClients) {
    try {
      client.write(`event: signs-update\ndata: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// SSE Stream for instant real-time sync across devices/tabs
app.get('/api/signs/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  // Send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', total: signsMemory.length })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// List all signs
app.get('/api/signs', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: signsMemory,
    total: signsMemory.length
  });
});

// Get single sign
app.get('/api/signs/:id', (req: Request, res: Response) => {
  const sign = signsMemory.find(s => s.id === req.params.id);
  if (!sign) {
    res.status(404).json({ success: false, error: 'Sinal não encontrado' });
    return;
  }
  res.json({ success: true, data: sign });
});

// Create new sign
app.post('/api/signs', (req: Request, res: Response) => {
  try {
    const { label, category, level, description, handConfig, movementExplanation, mediaUrl, mediaType, examples, isFeatured } = req.body;

    if (!label || !category || !level || !description) {
      res.status(400).json({ success: false, error: 'Campos obrigatórios faltando: rótulo, categoria, nível e descrição.' });
      return;
    }

    const newSign: SignItem = {
      id: `sinal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      label: String(label).trim(),
      category,
      level,
      description: String(description).trim(),
      handConfig: handConfig ? String(handConfig).trim() : '',
      movementExplanation: movementExplanation ? String(movementExplanation).trim() : '',
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || (mediaUrl?.startsWith('data:video') || mediaUrl?.endsWith('.mp4') || mediaUrl?.endsWith('.webm') ? 'video' : 'image'),
      examples: Array.isArray(examples) ? examples : [],
      isFeatured: Boolean(isFeatured),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    signsMemory.unshift(newSign);
    writeSignsToDisk(signsMemory);

    broadcastUpdate('create', newSign);

    res.status(201).json({
      success: true,
      message: 'Sinal adicionado com sucesso e propagado em tempo real!',
      data: newSign
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update existing sign
app.put('/api/signs/:id', (req: Request, res: Response) => {
  try {
    const index = signsMemory.findIndex(s => s.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, error: 'Sinal não encontrado para atualização.' });
      return;
    }

    const prev = signsMemory[index];
    const updatedSign: SignItem = {
      ...prev,
      ...req.body,
      id: prev.id, // prevent ID change
      updatedAt: Date.now()
    };

    signsMemory[index] = updatedSign;
    writeSignsToDisk(signsMemory);

    broadcastUpdate('update', updatedSign);

    res.json({
      success: true,
      message: 'Sinal atualizado com sucesso e sincronizado!',
      data: updatedSign
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete sign
app.delete('/api/signs/:id', (req: Request, res: Response) => {
  try {
    const sign = signsMemory.find(s => s.id === req.params.id);
    if (!sign) {
      res.status(404).json({ success: false, error: 'Sinal não encontrado para exclusão.' });
      return;
    }

    signsMemory = signsMemory.filter(s => s.id !== req.params.id);
    writeSignsToDisk(signsMemory);

    broadcastUpdate('delete', sign);

    res.json({
      success: true,
      message: 'Sinal removido com sucesso e sincronizado em tempo real!'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin stats
app.get('/api/stats', (req: Request, res: Response) => {
  const total = signsMemory.length;
  const letras = signsMemory.filter(s => s.category === 'letra').length;
  const numeros = signsMemory.filter(s => s.category === 'numero').length;
  const saudacoes = signsMemory.filter(s => s.category === 'saudacao').length;
  const palavras = signsMemory.filter(s => s.category === 'palavra').length;
  const videos = signsMemory.filter(s => s.mediaType === 'video').length;

  res.json({
    success: true,
    data: {
      total,
      letras,
      numeros,
      saudacoes,
      palavras,
      videos
    }
  });
});

// Hostinger Integration & Database Sync helper
app.post('/api/hostinger-sync', (req: Request, res: Response) => {
  const { subdomain, host, database, username, syncMode } = req.body;

  // Generate MySQL Schema and data script for Hostinger
  const sqlScript = [
    `-- ========================================================`,
    `-- Librando - Dicionário de Libras (Banco de Dados Hostinger)`,
    `-- Gerado automaticamente para subdomínio: ${subdomain || 'libras.asn.es.gov.br'}`,
    `-- Data: ${new Date().toISOString()}`,
    `-- ========================================================`,
    `CREATE TABLE IF NOT EXISTS \`libras_sinais\` (`,
    `  \`id\` VARCHAR(100) NOT NULL,`,
    `  \`label\` VARCHAR(150) NOT NULL,`,
    `  \`category\` VARCHAR(50) NOT NULL,`,
    `  \`level\` VARCHAR(50) NOT NULL DEFAULT 'iniciante',`,
    `  \`description\` TEXT NOT NULL,`,
    `  \`hand_config\` TEXT NULL,`,
    `  \`movement_explanation\` TEXT NULL,`,
    `  \`media_url\` LONGTEXT NULL,`,
    `  \`media_type\` VARCHAR(20) DEFAULT 'image',`,
    `  \`is_featured\` TINYINT(1) DEFAULT 0,`,
    `  \`created_at\` BIGINT NOT NULL,`,
    `  \`updated_at\` BIGINT NOT NULL,`,
    `  PRIMARY KEY (\`id\`)`,
    `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    ``,
    `-- Inserção dos ${signsMemory.length} sinais atuais:`,
    ...signsMemory.map(s => {
      const escape = (str: string = '') => str.replace(/'/g, "''").replace(/\\/g, '\\\\');
      return `INSERT INTO \`libras_sinais\` (\`id\`, \`label\`, \`category\`, \`level\`, \`description\`, \`hand_config\`, \`movement_explanation\`, \`media_url\`, \`media_type\`, \`is_featured\`, \`created_at\`, \`updated_at\`) VALUES ('${escape(s.id)}', '${escape(s.label)}', '${escape(s.category)}', '${escape(s.level)}', '${escape(s.description)}', '${escape(s.handConfig)}', '${escape(s.movementExplanation)}', '${escape(s.mediaUrl)}', '${escape(s.mediaType)}', ${s.isFeatured ? 1 : 0}, ${s.createdAt}, ${s.updatedAt}) ON DUPLICATE KEY UPDATE \`label\`=VALUES(\`label\`), \`description\`=VALUES(\`description\`), \`updated_at\`=VALUES(\`updated_at\`);`;
    })
  ].join('\n');

  res.json({
    success: true,
    message: 'Script e configuração Hostinger preparados com sucesso!',
    summary: {
      signsCount: signsMemory.length,
      targetSubdomain: subdomain || 'libras.asn.es.gov.br',
      database: database || 'u123456_libras',
      syncStatus: 'pronto'
    },
    sql: sqlScript
  });
});

// Gemini AI Helper for answering questions about Libras signs
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY não configurada no servidor.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

app.post('/api/gemini/explain', async (req: Request, res: Response) => {
  try {
    const { question, signLabel } = req.body;
    if (!question && !signLabel) {
      res.status(400).json({ success: false, error: 'Pergunta ou sinal não especificado.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.json({
        success: true,
        answer: `[Dica Pedagógica]: Para executar sinais em Libras com clareza, atente-se sempre aos 5 parâmetros fundamentais da língua: 1) Configuração de Mão (CM); 2) Ponto de Articulação (PA no corpo ou espaço neutro); 3) Movimento (direção e ritmo); 4) Orientação da Palma (para cima, baixo ou frente); 5) Expressão Facial/Corporal. Pratique em frente a um espelho ou acompanhe os vídeos demonstrativos do Librando!`
      });
      return;
    }

    const ai = getGeminiClient();
    const prompt = `Você é o tutor especialista em Libras (Língua Brasileira de Sinais) do aplicativo "Librando - Dicionário de Libras" da Escola EEEFM Antonio dos Santos Neves (ASN) no Espírito Santo.
Responda de forma didática, acolhedora, inclusiva e clara em português do Brasil.
Detalhe como realizar o sinal ou esclareça a dúvida pedagógica do aluno, explicando a Configuração de Mão (CM), o Ponto de Articulação (local no corpo ou espaço neutro), o Movimento e a Expressão Facial adequada.

Sinal ou Dúvida do usuário: "${question || signLabel}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    const answer = response.text || 'Não foi possível gerar a explicação no momento.';
    res.json({ success: true, answer });
  } catch (err: any) {
    console.error('Gemini error:', err);
    res.status(500).json({
      success: false,
      error: 'Erro ao consultar o assistente de Libras: ' + err.message
    });
  }
});

// ----------------------------------------------------
// VITE DEV MIDDLEWARE OR PRODUCTION SERVE
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Librando server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
