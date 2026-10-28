# Guia Completo de Deploy na VPS Hostinger — GOATBOT

Este guia contém o passo a passo para conectar na VPS da Hostinger via SSH, configurar o ambiente de produção, sincronizar o código e executar o bot com **PM2** ou **Docker Compose**.

---

## 1. Chave SSH Pública (Para colar na Hostinger)

Cole a chave pública abaixo no painel da **Hostinger** em **VPS > Gerenciar > Chaves SSH**:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKwxKk+cubEIN3ACN2V9XqVLWGUMa8lZpCwcPHMwpOoC goat-bot@hostinger
```

---

## 2. Conectando na VPS via Terminal

```bash
ssh root@<IP_DA_SUA_VPS>
```

---

## 3. Preparação do Servidor (Ubuntu / Debian)

Execute na VPS para atualizar pacotes e instalar Node.js 20 LTS, Git, FFmpeg e yt-dlp:

```bash
# 1. Atualiza repositórios
apt update && apt upgrade -y

# 2. Instala dependências básicas, Git, FFmpeg e Python
apt install -y curl git build-essential ffmpeg python3 python3-pip

# 3. Instala Node.js 20 LTS (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 4. Instala yt-dlp mais recente
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
chmod a+rx /usr/local/bin/yt-dlp

# 5. Instala PM2 globalmente
npm install -g pm2
```

---

## 4. Clonando e Configurando o Projeto

```bash
# Clone ou envie o repositório para /var/www/goat-bot
mkdir -p /var/www/goat-bot
cd /var/www/goat-bot

# Configure seu arquivo de variáveis de ambiente
cp .env.example .env
nano .env  # Insira seu OWNER_JID, BOT_TIMEZONE, etc.

# Crie as pastas essenciais
mkdir -p data sessao temp logs
```

---

## 5. Opção A: Executar via PM2 (Recomendado)

```bash
# 1. Instala dependências de produção
npm ci --omit=dev

# 2. Executa a suíte de validação
npm test

# 3. Inicia o processo no PM2 com auto-restart e logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 4. Para visualizar o QR Code e logs em tempo real:
pm2 logs goat-bot
```

---

## 6. Opção B: Executar via Docker Compose

```bash
# 1. Constrói a imagem e sobe o container em segundo plano
docker compose up -d --build

# 2. Visualiza logs e escaneia o QR Code
docker compose logs -f
```

---

## 7. Script de Deploy Automatizado

Para futuras atualizações, você pode simplesmente rodar o script de deploy incluído:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 8. Comandos Úteis do PM2

- **Monitorar Recursos:** `pm2 monit`
- **Ver Status:** `pm2 status`
- **Reiniciar:** `pm2 restart goat-bot`
- **Parar:** `pm2 stop goat-bot`
- **Visualizar Logs:** `pm2 logs goat-bot --lines 100`

