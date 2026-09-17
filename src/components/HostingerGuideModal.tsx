import React, { useState } from 'react';
import { X, Globe, Database, Download, Check, Copy, Server, ExternalLink, ShieldCheck, FileCode, CheckCircle2, ArrowRight } from 'lucide-react';
import { HostingerConfig } from '../types';
import { api } from '../services/api';

interface HostingerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  signsCount: number;
}

export const HostingerGuideModal: React.FC<HostingerGuideModalProps> = ({
  isOpen,
  onClose,
  signsCount
}) => {
  const [subdomain, setSubdomain] = useState('libras.asn.es.gov.br');
  const [dbHost, setDbHost] = useState('localhost');
  const [dbName, setDbName] = useState('u123456789_libras');
  const [dbUser, setDbUser] = useState('u123456789_admin');
  const [dbPass, setDbPass] = useState('SuaSenhaSegura@123');
  const [generatedSql, setGeneratedSql] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPhp, setCopiedPhp] = useState(false);
  const [copiedHtaccess, setCopiedHtaccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'passo-a-passo' | 'arquivos' | 'config' | 'sql'>('passo-a-passo');

  if (!isOpen) return null;

  const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On

  # 1. Rotas de API direcionadas para o arquivo PHP
  RewriteRule ^api/(.*)$ api.php?$1 [QSA,L]
  RewriteRule ^api$ api.php [QSA,L]

  # 2. Servir arquivos e pastas estáticos reais (JS, CSS, imagens, vídeos)
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # 3. Redirecionar todas as outras páginas para o index.html (SPA React)
  RewriteRule ^ index.html [L]
</IfModule>

# Habilitar CORS para permitir requisições e sincronização
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>

# Permitir upload de vídeos até 64MB (protegido contra erro 500 caso PHP-FPM esteja ativo na Hostinger)
<IfModule mod_php.c>
  php_value upload_max_filesize 64M
  php_value post_max_size 64M
  php_value max_execution_time 300
</IfModule>
<IfModule mod_php7.c>
  php_value upload_max_filesize 64M
  php_value post_max_size 64M
  php_value max_execution_time 300
</IfModule>`;

  const phpBridgeCode = `<?php
/**
 * Librando - Backend PHP & MySQL para Hostinger
 * Subdomínio: ${subdomain}
 * EEEFM Antonio dos Santos Neves (ASN)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$DB_HOST = '${dbHost}';
$DB_NAME = '${dbName}';
$DB_USER = '${dbUser}';
$DB_PASS = '${dbPass}';

try {
    $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Falha de conexão MySQL Hostinger: ' . $e->getMessage()
    ]);
    exit;
}

// Criação automática da tabela
$pdo->exec("CREATE TABLE IF NOT EXISTS \`libras_sinais\` (
    \`id\` VARCHAR(100) NOT NULL,
    \`label\` VARCHAR(150) NOT NULL,
    \`category\` VARCHAR(50) NOT NULL,
    \`level\` VARCHAR(50) NOT NULL DEFAULT 'iniciante',
    \`description\` TEXT NOT NULL,
    \`hand_config\` TEXT NULL,
    \`movement_explanation\` TEXT NULL,
    \`media_url\` LONGTEXT NULL,
    \`media_type\` VARCHAR(20) DEFAULT 'image',
    \`examples_json\` TEXT NULL,
    \`is_featured\` TINYINT(1) DEFAULT 0,
    \`created_at\` BIGINT NOT NULL,
    \`updated_at\` BIGINT NOT NULL,
    PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?? [];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM libras_sinais ORDER BY is_featured DESC, label ASC");
    $rows = $stmt->fetchAll();
    $sinais = [];
    foreach ($rows as $row) {
        $sinais[] = [
            'id' => $row['id'],
            'label' => $row['label'],
            'category' => $row['category'],
            'level' => $row['level'],
            'description' => $row['description'],
            'handConfig' => $row['hand_config'],
            'movementExplanation' => $row['movement_explanation'],
            'mediaUrl' => $row['media_url'],
            'mediaType' => $row['media_type'],
            'examples' => !empty($row['examples_json']) ? json_decode($row['examples_json'], true) : [],
            'isFeatured' => (bool)$row['is_featured'],
            'createdAt' => (int)$row['created_at'],
            'updatedAt' => (int)$row['updated_at']
        ];
    }
    echo json_encode(['success' => true, 'total' => count($sinais), 'data' => $sinais]);
    exit;
}

if ($method === 'POST') {
    if (empty($body['label']) || empty($body['description'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Campos obrigatórios faltando.']);
        exit;
    }
    $id = !empty($body['id']) ? $body['id'] : ('sinal-' . round(microtime(true)*1000));
    $stmt = $pdo->prepare("INSERT INTO \`libras_sinais\` 
        (\`id\`, \`label\`, \`category\`, \`level\`, \`description\`, \`hand_config\`, \`movement_explanation\`, \`media_url\`, \`media_type\`, \`examples_json\`, \`is_featured\`, \`created_at\`, \`updated_at\`) 
        VALUES (:id, :label, :category, :level, :description, :hand_config, :movement_explanation, :media_url, :media_type, :examples_json, :is_featured, :created_at, :updated_at)
        ON DUPLICATE KEY UPDATE 
            \`label\`=VALUES(\`label\`), \`description\`=VALUES(\`description\`), \`media_url\`=VALUES(\`media_url\`), \`updated_at\`=VALUES(\`updated_at\`);");
    
    $timeNow = round(microtime(true)*1000);
    $stmt->execute([
        ':id' => $id,
        ':label' => $body['label'],
        ':category' => $body['category'] ?? 'palavra',
        ':level' => $body['level'] ?? 'iniciante',
        ':description' => $body['description'],
        ':hand_config' => $body['handConfig'] ?? '',
        ':movement_explanation' => $body['movementExplanation'] ?? '',
        ':media_url' => $body['mediaUrl'] ?? '',
        ':media_type' => $body['mediaType'] ?? 'image',
        ':examples_json' => !empty($body['examples']) ? json_encode($body['examples'], JSON_UNESCAPED_UNICODE) : '[]',
        ':is_featured' => !empty($body['isFeatured']) ? 1 : 0,
        ':created_at' => $timeNow,
        ':updated_at' => $timeNow
    ]);

    echo json_encode(['success' => true, 'message' => 'Sinal sincronizado no banco Hostinger!']);
    exit;
}
?>`;

  const handleGenerateSql = async () => {
    setLoading(true);
    try {
      const config: HostingerConfig = {
        host: dbHost,
        database: dbName,
        username: dbUser,
        subdomain,
        syncEnabled: true
      };

      const result = await api.syncHostinger(config);
      if (result.sql) {
        setGeneratedSql(result.sql);
        setActiveTab('sql');
      }
    } catch (err: any) {
      alert('Erro ao gerar SQL: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 bg-[#071e63]/85 backdrop-blur-sm z-[250] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative my-auto border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 border-b border-slate-100 pb-5 mb-5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0a2b8c] to-[#1a4fd6] text-white flex items-center justify-center p-3 shadow-md">
            <Globe className="w-7 h-7 text-[#F5C400]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase text-[#F5C400] bg-[#071e63] px-2.5 py-0.5 rounded-full">
                Guia Oficial Hostinger
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pronto para Subdomínio</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0d1a4a] mt-1">
              Hospedar no Subdomínio da Hostinger
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Sincronização instantânea com o banco de dados MySQL da própria hospedagem
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'passo-a-passo', label: '📖 1. Passo a Passo no hPanel' },
            { id: 'arquivos', label: '📦 2. Baixar Arquivos Prontos' },
            { id: 'config', label: '⚙️ 3. Configurar Credenciais' },
            { id: 'sql', label: '🗄️ 4. Visualizar SQL' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-black rounded-t-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0a2b8c] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: PASSO A PASSO NO HPANEL */}
        {activeTab === 'passo-a-passo' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-4 rounded-2xl text-xs text-blue-950 font-medium leading-relaxed">
              <span className="font-black text-blue-900 block mb-1">
                🚀 Como funciona no seu subdomínio da Hostinger:
              </span>
              O site rodará diretamente no subdomínio (ex: <code>libras.seusite.com.br</code>) com layout responsivo e o banco de dados MySQL da Hostinger salvará qualquer novo vídeo ou sinal adicionado pelo painel em tempo real!
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 hover:border-[#0a2b8c]/30 shadow-sm transition-all flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#0a2b8c] text-white flex items-center justify-center font-black flex-shrink-0 text-sm shadow">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-[#0d1a4a]">Criar o Subdomínio no hPanel</h4>
                    <span className="text-[10px] font-bold text-slate-400">hPanel → Websites → Subdomínios</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    No painel da Hostinger, vá em <strong>Websites → Subdomínios</strong> e digite o prefixo desejado (ex: <code>libras</code>). A Hostinger criará a pasta <code>public_html/libras/</code>.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 hover:border-[#0a2b8c]/30 shadow-sm transition-all flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#0a2b8c] text-white flex items-center justify-center font-black flex-shrink-0 text-sm shadow">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-[#0d1a4a]">Criar o Banco de Dados MySQL</h4>
                    <span className="text-[10px] font-bold text-slate-400">hPanel → Bancos de Dados</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Vá em <strong>Bancos de Dados → Gerenciamento de MySQL</strong> e crie uma nova base (ex: <code>libras</code>), um usuário (ex: <code>admin</code>) e defina sua senha.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 hover:border-[#0a2b8c]/30 shadow-sm transition-all flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#0a2b8c] text-white flex items-center justify-center font-black flex-shrink-0 text-sm shadow">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-[#0d1a4a]">Importar o Banco no phpMyAdmin</h4>
                    <span className="text-[10px] font-bold text-slate-400">phpMyAdmin → Importar</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Abra o <strong>phpMyAdmin</strong> ao lado do banco criado, vá na aba <strong>Importar</strong> e envie o arquivo <code>libras_database.sql</code> (disponível na aba "2. Baixar Arquivos Prontos").
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 hover:border-[#0a2b8c]/30 shadow-sm transition-all flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#0a2b8c] text-white flex items-center justify-center font-black flex-shrink-0 text-sm shadow">
                  4
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-[#0d1a4a]">Upload para a Pasta do Subdomínio (Atenção à estrutura)</h4>
                    <span className="text-[10px] font-bold text-slate-400">public_html/librando/</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    No <strong>Gerenciador de Arquivos</strong> da Hostinger, abra exatamente a pasta <code>public_html/librando/</code>. Os arquivos devem ficar <strong>direto dentro dela</strong> (não coloque uma pasta <code>dist</code> dentro dela):
                  </p>
                  <div className="mt-2 p-2.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed">
                    📁 public_html/librando/<br />
                    &nbsp;&nbsp;├── 📁 assets/ <span className="text-slate-400">(arquivos .js e .css)</span><br />
                    &nbsp;&nbsp;├── 📄 index.html <span className="text-[#F5C400] font-bold">(direto na pasta librando)</span><br />
                    &nbsp;&nbsp;├── 📄 api.php<br />
                    &nbsp;&nbsp;└── ⚙️ .htaccess <span className="text-emerald-400">(verifique se arquivos ocultos estão visíveis)</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('arquivos')}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#F5C400] hover:bg-[#ffd633] text-[#071e63] font-black text-xs shadow-md transition-all"
              >
                <span>Avançar para Baixar Arquivos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: BAIXAR ARQUIVOS PRONTOS */}
        {activeTab === 'arquivos' && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-700">
              <span className="font-black text-slate-900 block mb-1">Arquivos Gerados & Prontos para Hostinger:</span>
              Baixe os 3 arquivos abaixo para colocar na pasta do seu subdomínio na Hostinger.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* File 1: SQL */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-2">
                    <Database className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-xs text-slate-900">libras_database.sql</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tabela completa com os {signsCount} sinais pré-cadastrados.
                  </p>
                </div>
                <button
                  onClick={handleGenerateSql}
                  className="mt-3 w-full py-2 rounded-xl bg-[#0a2b8c] hover:bg-[#1a3da8] text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .SQL</span>
                </button>
              </div>

              {/* File 2: api.php */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 mx-auto flex items-center justify-center mb-2">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-xs text-slate-900">api.php</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Bridge PHP para conectar com o MySQL e upload de vídeos.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadFile('api.php', phpBridgeCode, 'application/x-php')}
                  className="mt-3 w-full py-2 rounded-xl bg-[#F5C400] hover:bg-[#ffd633] text-[#071e63] text-xs font-black flex items-center justify-center space-x-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar api.php</span>
                </button>
              </div>

              {/* File 3: .htaccess */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-2">
                    <Server className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-xs text-slate-900">.htaccess</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Regras de roteamento Apache/LiteSpeed para a Hostinger.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadFile('.htaccess', htaccessContent, 'text/plain')}
                  className="mt-3 w-full py-2 rounded-xl bg-slate-800 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .htaccess</span>
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center space-x-2">
              <span className="font-bold">💡 Dica:</span>
              <span>Você pode ajustar a senha e o nome do banco na aba <strong>3. Configurar Credenciais</strong> antes de baixar o <code>api.php</code> para que ele já venha pronto!</span>
            </div>
          </div>
        )}

        {/* TAB 3: CONFIGURAR CREDENCIAIS */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-semibold">
              Preencha com os dados do banco criado no hPanel da Hostinger. O arquivo <code>api.php</code> e o script SQL serão gerados com estas informações:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                  Subdomínio Desejado na Hostinger
                </label>
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="libras.asn.es.gov.br"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                  Host MySQL (Hostinger)
                </label>
                <input
                  type="text"
                  value={dbHost}
                  onChange={(e) => setDbHost(e.target.value)}
                  placeholder="localhost"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                  Nome do Banco de Dados
                </label>
                <input
                  type="text"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="u123456_libras"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                  Usuário MySQL
                </label>
                <input
                  type="text"
                  value={dbUser}
                  onChange={(e) => setDbUser(e.target.value)}
                  placeholder="u123456_admin"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                  Senha do Banco MySQL
                </label>
                <input
                  type="text"
                  value={dbPass}
                  onChange={(e) => setDbPass(e.target.value)}
                  placeholder="SuaSenhaSegura@123"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                Os dados são processados com segurança no seu navegador.
              </span>
              <button
                onClick={() => handleDownloadFile('api.php', phpBridgeCode, 'application/x-php')}
                className="px-5 py-2.5 rounded-xl bg-[#F5C400] text-[#071e63] font-black text-xs shadow hover:bg-[#ffd633] transition-all flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar api.php com estes dados</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: SQL SCRIPT */}
        {activeTab === 'sql' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Script SQL pronto para importar no phpMyAdmin da Hostinger:
              </span>
              <div className="flex space-x-1.5">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSql || '');
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
                </button>
                <button
                  onClick={() => handleDownloadFile(`libras_hostinger_${subdomain}.sql`, generatedSql || '', 'text/sql')}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#F5C400] text-[#071e63] shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar .SQL</span>
                </button>
              </div>
            </div>

            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800">
              {generatedSql || 'Gere o SQL clicando em "Baixar .SQL" na aba Arquivos.'}
            </pre>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Hostinger LiteSpeed + PHP 8.x + MySQL 8.x compatível</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
