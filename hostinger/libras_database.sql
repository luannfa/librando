-- ====================================================================
-- BANCO DE DADOS HOSTINGER - APLICATIVO LIBRANDO
-- Dicionário Inclusivo e Guia de Libras
-- EEEFM Antonio dos Santos Neves (ASN) - Espírito Santo
-- ====================================================================

-- 1. Criação da Tabela de Sinais
CREATE TABLE IF NOT EXISTS `libras_sinais` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Inserção dos Sinais Pré-Cadastrados
INSERT INTO `libras_sinais` (`id`, `label`, `category`, `level`, `description`, `hand_config`, `movement_explanation`, `media_url`, `media_type`, `examples_json`, `is_featured`, `created_at`, `updated_at`) VALUES
('sinal-letra-a', 'Letra A', 'letra', 'iniciante', 'Mão fechada em punho com o polegar encostado verticalmente ao lado do dedo indicador.', 'Punho cerrado com polegar estendido lateralmente.', 'Mantenha a mão estática na altura do peito, palma voltada para a frente.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'image', '["Alfabeto dactilológico", "Soletrar nomes próprios"]', 1, 1710000000000, 1710000000000),
('sinal-letra-b', 'Letra B', 'letra', 'iniciante', 'Quatro dedos unidos e esticados para cima com o polegar dobrado sobre a palma da mão.', 'Quatro dedos estendidos para cima e unidos, polegar dobrado.', 'Posicione a mão na frente do ombro com a palma voltada para o interlocutor.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 'image', '["Letra B em palavras e soletração"]', 1, 1710000010000, 1710000010000),
('sinal-letra-c', 'Letra C', 'letra', 'iniciante', 'Mão curvada em formato da letra C, com todos os dedos e polegar formando um semicírculo.', 'Dedos flexionados em arco formando a letra C.', 'Mão imóvel na altura do ombro, palma voltada ligeiramente para o lado.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', 'image', '["C de Casa", "C de Carinho"]', 0, 1710000020000, 1710000020000),
('sinal-letra-l', 'Letra L', 'letra', 'iniciante', 'Indicador apontando para cima e polegar aberto a 90 graus formando a letra L.', 'Indicador e polegar abertos em ângulo reto.', 'Palma voltada para a frente, demonstrando claramente o ângulo em formato de L.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80', 'image', '["Libras", "Lápis", "Livro"]', 1, 1710000030000, 1710000030000),
('sinal-numero-1', 'Número 1', 'numero', 'iniciante', 'Dedo indicador estendido para cima, os outros dedos dobrados fechados pelo polegar.', 'Indicador estendido para cima isolado.', 'Mão na altura do peito, palma voltada para dentro ou frente com um ligeiro toque.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80', 'image', '["Contagem cardinal", "Quantidade 1"]', 1, 1710000040000, 1710000040000),
('sinal-numero-2', 'Número 2', 'numero', 'iniciante', 'Dedos indicador e médio estendidos para cima formando a letra V com a palma para a frente.', 'Indicador e médio abertos em V.', 'Mão estática na frente do peito, palma voltada para a frente.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', 'image', '["Contagem 2", "Dois colegas"]', 1, 1710000050000, 1710000050000),
('sinal-numero-3', 'Número 3', 'numero', 'iniciante', 'Dedos polegar, indicador e médio esticados (ou indicador, médio e anelar conforme contexto de Libras).', 'Três dedos estendidos para cima.', 'Mão estável na altura do ombro.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80', 'image', '["Quantidade 3"]', 0, 1710000060000, 1710000060000),
('sinal-saudacao-oi', 'Oi / Olá', 'saudacao', 'iniciante', 'Mão em configuração de letra O com o dedo mindinho levantado (letra I) ou aceno suave com a mão aberta.', 'Mão em letra O com dedo mínimo estendido (O + I = OI).', 'Movimento suave de arco ou pequeno balanço lateral na altura da cabeça acompanhado de sorriso amigável.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', 'image', '["Oi, tudo bem?", "Olá a todos!"]', 1, 1710000070000, 1710000070000),
('sinal-saudacao-obrigado', 'Obrigado(a)', 'saudacao', 'iniciante', 'Mão aberta toca levemente a testa com a ponta dos dedos e depois move-se para a frente em direção à outra pessoa.', 'Mão espalmada com dedos unidos.', 'Toque inicial na testa e movimento descendente para frente em direção ao interlocutor.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80', 'image', '["Muito obrigado pela ajuda", "Agradecimento respeitoso"]', 1, 1710000080000, 1710000080000),
('sinal-saudacao-bom-dia', 'Bom Dia', 'saudacao', 'iniciante', 'Sinal composto: mão toca o queixo e abre para a frente (BOM), seguida pelo sinal de DIA com a letra D cruzando o espaço.', 'Mão fechada no queixo abrindo para frente, depois letra D subindo como o sol.', 'Movimento fluido e caloroso com expressão facial acolhedora.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80', 'image', '["Bom dia a todos na escola!"]', 1, 1710000090000, 1710000090000),
('sinal-palavra-libras', 'LIBRAS', 'palavra', 'intermediario', 'Ambas as mãos abertas com dedos entrelaçando movimentos circulares alternados na frente do peito.', 'Mãos abertas com dedos estendidos e ligeiramente curvados.', 'Movimento circular alternado no espaço neutro simulando a fluidez das mãos conversando.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'image', '["Eu amo aprender Libras", "Língua Brasileira de Sinais"]', 1, 1710000100000, 1710000100000),
('sinal-palavra-escola', 'Escola / Colégio', 'palavra', 'intermediario', 'Sinal de CASA seguido do bater suave de palmas em Libras (estudar).', 'Mãos formando um telhado de casa, depois palmas em estudo.', 'Mãos se encontram no espaço neutro na altura do peito.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80', 'image', '["Escola ASN", "Vou para a escola estudar"]', 1, 1710000110000, 1710000110000),
('sinal-palavra-amigo', 'Amigo(a)', 'palavra', 'intermediario', 'Mão espalmada repousa com carinho sobre o peito do lado do coração, com leve tapinha afetuoso.', 'Mão aberta relaxada sobre a região do coração.', 'Toque leve com expressão amigável e afetuosa.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80', 'image', '["Você é meu grande amigo", "Amigos da turma"]', 1, 1710000120000, 1710000120000),
('sinal-palavra-familia', 'Família', 'familia', 'intermediario', 'Ambas as mãos em configuração de letra F tocam os polegares e indicadores e fazem um círculo até os dedos mínimos se tocarem.', 'Ambas as mãos na configuração da letra F.', 'Movimento horizontal circular de fora para dentro, fechando o círculo de união familiar.', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80', 'image', '["Minha família reunida", "Amor de família"]', 1, 1710000130000, 1710000130000),
('sinal-palavra-inclusao', 'Inclusão Social', 'palavra', 'avancado', 'Uma mão em semicírculo acolhe e abraça a outra mão que se junta ao grupo no centro.', 'Mão esquerda em arco acolhedor; mão direita entra suavemente.', 'Movimento convergente simbolizando acolhimento e pertencimento de todas as pessoas.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', 'image', '["Inclusão escolar para todos", "Sociedade acessível"]', 1, 1710000140000, 1710000140000)
ON DUPLICATE KEY UPDATE `label`=VALUES(`label`), `description`=VALUES(`description`), `updated_at`=VALUES(`updated_at`);
