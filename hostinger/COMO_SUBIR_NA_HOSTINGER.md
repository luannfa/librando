# Guia Passo a Passo: Como Subir o Librando na Hostinger num Subdomínio

Este guia ensina exatamente como hospedar o aplicativo **Librando** em um subdomínio (ex: `libras.seusite.com.br` ou `libras.asn.es.gov.br`) na Hostinger, utilizando o banco de dados MySQL para sincronização instantânea.

---

## 📋 Arquivos Prontos na Pasta `hostinger/`:
1. `.htaccess` - Configura o servidor LiteSpeed/Apache da Hostinger para roteamento correto da SPA React e do PHP.
2. `api.php` - Backend PHP que gerencia a gravação e leitura dos sinais no MySQL da Hostinger.
3. `libras_database.sql` - Script SQL com a tabela `libras_sinais` e todos os sinais pré-cadastrados.

---

## 🚀 Passo 1: Criar o Subdomínio na Hostinger (hPanel)

1. Acesse o painel da Hostinger: [https://hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Clique no seu domínio principal ou hospedagem.
3. No menu lateral esquerdo, vá em **Websites** ou procure pela opção **Subdomínios**.
4. Digite o nome desejado para o subdomínio:
   - Exemplo: `libras` (criará `libras.seusite.com.br`).
5. A Hostinger criará automaticamente uma pasta no seu Gerenciador de Arquivos, geralmente localizada em:
   - `public_html/libras/`
6. Clique em **Criar**.

---

## 🗄️ Passo 2: Criar o Banco de Dados MySQL na Hostinger

1. No menu lateral do hPanel, clique em **Bancos de Dados** → **Gerenciamento de MySQL**.
2. Em **Criar Novo Banco de Dados e Usuário MySQL**, informe:
   - **Nome do Banco de Dados**: ex: `libras` (o hPanel adicionará o prefixo, ex: `u123456789_libras`).
   - **Nome de Usuário**: ex: `admin` (ex: `u123456789_admin`).
   - **Senha**: defina uma senha segura e anote-a.
3. Clique em **Criar**.

---

## 📥 Passo 3: Importar a Tabela no phpMyAdmin

1. Na mesma página de bancos de dados do hPanel, role até a lista de bancos existentes e clique em **phpMyAdmin** ao lado do banco recém-criado.
2. Com o phpMyAdmin aberto, clique na aba superior **Importar**.
3. Clique em **Escolher Arquivo** e selecione o arquivo `hostinger/libras_database.sql`.
4. Role até o final e clique no botão **Executar** / **Importar**.
5. *Pronto! A tabela `libras_sinais` e todos os sinais estarão carregados.*

---

## ⚙️ Passo 4: Configurar a Conexão no `api.php`

Abra o arquivo `hostinger/api.php` e altere as linhas 27 a 30 com os dados do banco criado no Passo 2:

```php
$DB_HOST = 'localhost';          // Mantenha 'localhost'
$DB_NAME = 'u123456789_libras';  // Nome completo do banco no hPanel
$DB_USER = 'u123456789_admin';   // Usuário completo no hPanel
$DB_PASS = 'SUA_SENHA_AQUI';     // A senha que você definiu
```

---

## 📤 Passo 5: Fazer o Upload para a Pasta do Subdomínio

1. No menu lateral do hPanel, clique em **Arquivos** → **Gerenciador de Arquivos**.
2. Abra a pasta correspondente ao subdomínio:
   - Caminho: `public_html/libras/` (ou a pasta que você escolheu no Passo 1).
3. Gere os arquivos de produção do projeto executando `npm run build` (que cria a pasta `dist/`).
4. Envie para dentro de `public_html/libras/`:
   - Todo o conteúdo gerado dentro da pasta `dist/` (incluindo `index.html`, pasta `assets/`, etc.).
   - O arquivo `.htaccess` (da pasta `hostinger/`).
   - O arquivo `api.php` configurado (da pasta `hostinger/`).
5. Certifique-se de que o arquivo `.htaccess` e `api.php` fiquem na mesma pasta onde está o `index.html`.

---

## 🔒 Passo 6: Ativar SSL Grátis (HTTPS)

1. No hPanel da Hostinger, vá na seção **Segurança** → **SSL**.
2. Instale o certificado SSL Let's Encrypt gratuito para o subdomínio criado.
3. Ative a opção **Forçar HTTPS**.

---

## 🌐 Testando o Subdomínio

Abra no navegador: `https://libras.seusite.com.br`

- As cartas de sinais carregarão diretamente.
- Ao acessar o **Painel Escolar (Admin)** com a senha `Admin@2026`, qualquer novo sinal cadastrado é salvo diretamente no MySQL da Hostinger e fica disponível em tempo real para todos os alunos e visitantes.
