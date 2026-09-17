<?php
/**
 * Librando - Backend PHP & MySQL para Hostinger
 * Aplicativo: Librando - Dicionário e Guia de Libras
 * EEEFM Antonio dos Santos Neves (ASN)
 *
 * Instruções:
 * 1. Preencha as credenciais do seu banco de dados MySQL criado na Hostinger abaixo.
 * 2. Envie este arquivo para a pasta raiz do seu subdomínio na Hostinger (ex: public_html/libras/).
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Responder requisições OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ====================================================================
// CONFIGURAÇÕES DO BANCO DE DADOS HOSTINGER
// Altere com os dados que você criou no hPanel da Hostinger:
// ====================================================================
$DB_HOST = 'localhost';          // Normalmente 'localhost' na Hostinger
$DB_NAME = 'u123456789_libras';  // Nome do seu banco criado no hPanel
$DB_USER = 'u123456789_admin';   // Nome do usuário MySQL criado no hPanel
$DB_PASS = 'SUA_SENHA_AQUI';     // Senha definida no hPanel

// Conexão com o banco de dados MySQL usando PDO
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
        'error' => 'Falha ao conectar ao banco de dados MySQL da Hostinger: ' . $e->getMessage(),
        'tip' => 'Verifique se o nome do banco, usuário e senha estão corretos no arquivo api.php'
    ]);
    exit;
}

// Criar tabela automaticamente se ainda não existir
$pdo->exec("CREATE TABLE IF NOT EXISTS `libras_sinais` (
    `id` VARCHAR(100) NOT NULL,
    `label` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `level` VARCHAR(50) NOT NULL DEFAULT 'iniciante',
    `description` TEXT NOT NULL,
    `hand_config` TEXT NULL,
    `movement_explanation` TEXT NULL,
    `media_url` LONGTEXT NULL,
    `media_type` VARCHAR(20) DEFAULT 'image',
    `examples_json` TEXT NULL,
    `is_featured` TINYINT(1) DEFAULT 0,
    `created_at` BIGINT NOT NULL,
    `updated_at` BIGINT NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Pasta para salvar uploads de vídeos e fotos
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

// Função auxiliar para salvar arquivos base64 se enviados
function saveBase64Media($dataUrl, $uploadDir) {
    if (empty($dataUrl) || strpos($dataUrl, 'data:') !== 0) {
        return $dataUrl; // Já é uma URL externa
    }

    $parts = explode(',', $dataUrl);
    if (count($parts) < 2) return $dataUrl;

    $meta = $parts[0];
    $data = base64_decode($parts[1]);

    $ext = 'png';
    if (strpos($meta, 'video/mp4') !== false) $ext = 'mp4';
    else if (strpos($meta, 'video/webm') !== false) $ext = 'webm';
    else if (strpos($meta, 'image/jpeg') !== false) $ext = 'jpg';
    else if (strpos($meta, 'image/webp') !== false) $ext = 'webp';
    else if (strpos($meta, 'image/gif') !== false) $ext = 'gif';

    $filename = 'sinal_' . time() . '_' . substr(md5(uniqid()), 0, 8) . '.' . $ext;
    $filePath = $uploadDir . $filename;

    if (file_put_contents($filePath, $data)) {
        // Obter URL relativa ou absoluta do site
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];
        return $protocol . $host . '/uploads/' . $filename;
    }

    return $dataUrl;
}

$method = $_SERVER['REQUEST_METHOD'];

// Obter dados brutos JSON para POST, PUT e DELETE
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? [];

// ROTA 1: GET (Listar sinais ou obter estatísticas)
if ($method === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'stats') {
        $total = $pdo->query("SELECT COUNT(*) FROM libras_sinais")->fetchColumn();
        $letras = $pdo->query("SELECT COUNT(*) FROM libras_sinais WHERE category='letra'")->fetchColumn();
        $numeros = $pdo->query("SELECT COUNT(*) FROM libras_sinais WHERE category='numero'")->fetchColumn();
        $saudacoes = $pdo->query("SELECT COUNT(*) FROM libras_sinais WHERE category='saudacao'")->fetchColumn();
        $palavras = $pdo->query("SELECT COUNT(*) FROM libras_sinais WHERE category='palavra'")->fetchColumn();
        $videos = $pdo->query("SELECT COUNT(*) FROM libras_sinais WHERE media_type='video'")->fetchColumn();

        echo json_encode([
            'success' => true,
            'data' => [
                'total' => (int)$total,
                'letras' => (int)$letras,
                'numeros' => (int)$numeros,
                'saudacoes' => (int)$saudacoes,
                'palavras' => (int)$palavras,
                'videos' => (int)$videos
            ]
        ]);
        exit;
    }

    // Listar todos os sinais
    $stmt = $pdo->query("SELECT * FROM libras_sinais ORDER BY is_featured DESC, label ASC");
    $rows = $stmt->fetchAll();

    $sinais = [];
    foreach ($rows as $row) {
        $examples = [];
        if (!empty($row['examples_json'])) {
            $examples = json_decode($row['examples_json'], true) ?? [];
        }

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
            'examples' => $examples,
            'isFeatured' => (bool)$row['is_featured'],
            'createdAt' => (int)$row['created_at'],
            'updatedAt' => (int)$row['updated_at']
        ];
    }

    echo json_encode([
        'success' => true,
        'total' => count($sinais),
        'data' => $sinais
    ]);
    exit;
}

// ROTA 2: POST (Criar novo sinal)
if ($method === 'POST') {
    if (empty($body['label']) || empty($body['category']) || empty($body['description'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Preencha o título, categoria e descrição do sinal.']);
        exit;
    }

    $id = !empty($body['id']) ? $body['id'] : ('sinal-' . round(microtime(true) * 1000) . '-' . substr(md5(uniqid()), 0, 5));
    $label = trim($body['label']);
    $category = $body['category'];
    $level = !empty($body['level']) ? $body['level'] : 'iniciante';
    $description = trim($body['description']);
    $handConfig = !empty($body['handConfig']) ? trim($body['handConfig']) : '';
    $movementExplanation = !empty($body['movementExplanation']) ? trim($body['movementExplanation']) : '';
    
    // Processar imagem ou vídeo
    $mediaUrl = !empty($body['mediaUrl']) ? saveBase64Media($body['mediaUrl'], $uploadDir) : '';
    $mediaType = !empty($body['mediaType']) ? $body['mediaType'] : 'image';
    
    $examplesJson = (!empty($body['examples']) && is_array($body['examples'])) ? json_encode($body['examples'], JSON_UNESCAPED_UNICODE) : '[]';
    $isFeatured = !empty($body['isFeatured']) ? 1 : 0;
    $timeNow = round(microtime(true) * 1000);

    $stmt = $pdo->prepare("INSERT INTO `libras_sinais` 
        (`id`, `label`, `category`, `level`, `description`, `hand_config`, `movement_explanation`, `media_url`, `media_type`, `examples_json`, `is_featured`, `created_at`, `updated_at`) 
        VALUES (:id, :label, :category, :level, :description, :hand_config, :movement_explanation, :media_url, :media_type, :examples_json, :is_featured, :created_at, :updated_at)
        ON DUPLICATE KEY UPDATE 
            `label`=VALUES(`label`), 
            `category`=VALUES(`category`), 
            `level`=VALUES(`level`), 
            `description`=VALUES(`description`), 
            `hand_config`=VALUES(`hand_config`), 
            `movement_explanation`=VALUES(`movement_explanation`), 
            `media_url`=VALUES(`media_url`), 
            `media_type`=VALUES(`media_type`), 
            `examples_json`=VALUES(`examples_json`), 
            `is_featured`=VALUES(`is_featured`), 
            `updated_at`=VALUES(`updated_at`);");

    $stmt->execute([
        ':id' => $id,
        ':label' => $label,
        ':category' => $category,
        ':level' => $level,
        ':description' => $description,
        ':hand_config' => $handConfig,
        ':movement_explanation' => $movementExplanation,
        ':media_url' => $mediaUrl,
        ':media_type' => $mediaType,
        ':examples_json' => $examplesJson,
        ':is_featured' => $isFeatured,
        ':created_at' => $timeNow,
        ':updated_at' => $timeNow
    ]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Sinal gravado no banco de dados da Hostinger com sucesso!',
        'data' => [
            'id' => $id,
            'label' => $label,
            'category' => $category,
            'level' => $level,
            'description' => $description,
            'handConfig' => $handConfig,
            'movementExplanation' => $movementExplanation,
            'mediaUrl' => $mediaUrl,
            'mediaType' => $mediaType,
            'examples' => !empty($body['examples']) ? $body['examples'] : [],
            'isFeatured' => (bool)$isFeatured,
            'createdAt' => $timeNow,
            'updatedAt' => $timeNow
        ]
    ]);
    exit;
}

// ROTA 3: PUT (Atualizar sinal existente)
if ($method === 'PUT') {
    $id = $body['id'] ?? ($_GET['id'] ?? null);
    if (!$id && !empty($_SERVER['QUERY_STRING']) && strpos($_SERVER['QUERY_STRING'], 'signs/') !== false) {
        $parts = explode('signs/', $_SERVER['QUERY_STRING']);
        $id = end($parts);
    }

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID do sinal não fornecido.']);
        exit;
    }
    $label = trim($body['label'] ?? '');
    $category = $body['category'] ?? 'palavra';
    $level = $body['level'] ?? 'iniciante';
    $description = trim($body['description'] ?? '');
    $handConfig = trim($body['handConfig'] ?? '');
    $movementExplanation = trim($body['movementExplanation'] ?? '');
    $mediaUrl = !empty($body['mediaUrl']) ? saveBase64Media($body['mediaUrl'], $uploadDir) : '';
    $mediaType = $body['mediaType'] ?? 'image';
    $examplesJson = (!empty($body['examples']) && is_array($body['examples'])) ? json_encode($body['examples'], JSON_UNESCAPED_UNICODE) : '[]';
    $isFeatured = !empty($body['isFeatured']) ? 1 : 0;
    $timeNow = round(microtime(true) * 1000);

    $stmt = $pdo->prepare("UPDATE `libras_sinais` SET 
        `label` = :label,
        `category` = :category,
        `level` = :level,
        `description` = :description,
        `hand_config` = :hand_config,
        `movement_explanation` = :movement_explanation,
        `media_url` = :media_url,
        `media_type` = :media_type,
        `examples_json` = :examples_json,
        `is_featured` = :is_featured,
        `updated_at` = :updated_at
        WHERE `id` = :id");

    $stmt->execute([
        ':id' => $id,
        ':label' => $label,
        ':category' => $category,
        ':level' => $level,
        ':description' => $description,
        ':hand_config' => $handConfig,
        ':movement_explanation' => $movementExplanation,
        ':media_url' => $mediaUrl,
        ':media_type' => $mediaType,
        ':examples_json' => $examplesJson,
        ':is_featured' => $isFeatured,
        ':updated_at' => $timeNow
    ]);

    echo json_encode(['success' => true, 'message' => 'Sinal atualizado com sucesso!']);
    exit;
}

// ROTA 4: DELETE (Remover sinal)
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? ($body['id'] ?? null);
    if (!$id && !empty($_SERVER['QUERY_STRING']) && strpos($_SERVER['QUERY_STRING'], 'signs/') !== false) {
        $parts = explode('signs/', $_SERVER['QUERY_STRING']);
        $id = end($parts);
    }
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID do sinal não fornecido para exclusão.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM `libras_sinais` WHERE `id` = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'message' => 'Sinal removido do banco Hostinger com sucesso!']);
    exit;
}
