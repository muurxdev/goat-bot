#!/usr/bin/env bash
# ==========================================
# 🚀 GOAT BOT XP — AUTOMATED VPS DEPLOY SCRIPT
# ==========================================

set -e

echo "=========================================="
echo "🚀 Iniciando deploy do GOATBot..."
echo "=========================================="

# 1. Checa Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor instale o Node.js v20+ antes de continuar."
    exit 1
fi

echo "✔ Node.js version: $(node -v)"

# 2. Cria arquivo .env se não existir
if [ ! -f .env ]; then
    echo "⚠️ Arquivo .env não encontrado. Criando a partir de .env.example..."
    cp .env.example .env
fi

# 3. Cria diretórios essenciais
mkdir -p data sessao temp logs

# 4. Instala dependências
echo "📦 Instalando dependências de produção..."
npm install --omit=dev

# 5. Executa suíte de testes
echo "🧪 Executando suíte de testes automatizados..."
npm test

# 6. Inicialização com PM2 ou Docker
if command -v pm2 &> /dev/null; then
    echo "⚡ Iniciando/Recarregando processo no PM2..."
    pm2 startOrRestart ecosystem.config.js
    pm2 save
    echo "✅ Bot iniciado com sucesso no PM2!"
    echo "📌 Use 'pm2 logs goat-bot-xp' para acompanhar o status e QR code."
elif command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Iniciando com Docker Compose..."
    docker-compose up -d --build
    echo "✅ Bot iniciado com sucesso no Docker!"
else
    echo "ℹ️ PM2 e Docker não detectados. Para iniciar manualmente execute:"
    echo "   npm start"
fi

echo "=========================================="
echo "🎉 Deploy concluído com sucesso!"
echo "=========================================="

