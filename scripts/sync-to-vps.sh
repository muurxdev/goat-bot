#!/usr/bin/env bash
# ==========================================
# 🚀 SYNC SESSÃO E CÓDIGO DO PC LOCAL PARA A VPS HOSTINGER
# ==========================================

set -e

if [ -z "$1" ]; then
    echo "=================================================="
    echo "❌ Erro: Informe o IP ou host da sua VPS Hostinger."
    echo "📌 Exemplo de uso:"
    echo "   ./scripts/sync-to-vps.sh root@185.xxx.xxx.xxx"
    echo "=================================================="
    exit 1
fi

VPS_TARGET="$1"
REMOTE_DIR="/var/www/meliodasbotxp"

echo "=================================================="
echo "🚀 Sincronizando GOATBot para: $VPS_TARGET"
echo "📂 Diretório de Destino: $REMOTE_DIR"
echo "=================================================="

# 1. Cria a pasta remota na VPS
ssh "$VPS_TARGET" "mkdir -p $REMOTE_DIR/sessao $REMOTE_DIR/data $REMOTE_DIR/logs $REMOTE_DIR/backups $REMOTE_DIR/temp"

# 2. Sincroniza código e credenciais já autenticadas
# IMPORTANTE: data/, sessao/, backups/, logs/, temp/ e node_modules são EXCLUÍDOS
# para preservar o estado persistente que vive na VPS (volumes do Docker).
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'data' \
    --exclude 'sessao' \
    --exclude 'temp' \
    --exclude 'logs' \
    --exclude 'backups' \
    ./ "$VPS_TARGET:$REMOTE_DIR/"

echo "=================================================="
echo "📦 Executando instalação e reload na VPS..."
echo "=================================================="

ssh "$VPS_TARGET" "cd $REMOTE_DIR && npm install --omit=dev && pm2 startOrRestart ecosystem.config.js && pm2 save"

echo "=================================================="
echo "✅ BOT DEPLOYADO E ATIVO NA VPS COM SESSÃO VÁLIDA!"
echo "📌 Para ver os logs: ssh $VPS_TARGET 'pm2 logs goat-bot-xp'"
echo "=================================================="

