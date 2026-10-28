#!/usr/bin/env bash
# ==============================================================================
# 🚀 GOAT BOT XP — MIGRADOR DE SESSÃO E BANCO DE DADOS ENTRE VPS
# ==============================================================================
# Copia as credenciais do WhatsApp (sessao/), o banco de dados (data/database.sqlite)
# e o arquivo de variáveis (.env) da VPS antiga diretamente para a nova VPS,
# para que o bot suba autenticado sem precisar ler o QR Code novamente.
#
# Uso:
#   ./scripts/migrar_sessao_vps.sh <HOST_VPS_ANTIGA> <HOST_VPS_NOVA>
#
# Exemplo:
#   ./scripts/migrar_sessao_vps.sh root@SEU_IP_VPS_ANTIGO root@NOVO_IP_VPS
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 2 ]; then
    echo "=================================================="
    echo "❌ Erro: Informe a VPS de origem e a VPS de destino."
    echo "📌 Exemplo:"
    echo "   $0 root@SEU_IP_VPS_ANTIGO root@123.45.67.89"
    echo "=================================================="
    exit 1
fi

OLD_VPS="$1"
NEW_VPS="$2"
REMOTE_PATH="/var/www/meliodasbotxp"
BACKUP_TMP="/tmp/goat_migracao_$(date +%s)"

echo "=================================================="
echo "🔄 INICIANDO MIGRAÇÃO DE SESSÃO E DADOS"
echo "📤 Origem: $OLD_VPS"
echo "📥 Destino: $NEW_VPS"
echo "=================================================="

mkdir -p "$BACKUP_TMP"

echo "1/4 🛑 Pausando temporariamente o container na VPS antiga para cópia íntegra..."
ssh "$OLD_VPS" "docker stop goat_bot_xp || true"

echo "2/4 📥 Baixando 'sessao/', 'data/' e '.env' da VPS antiga..."
rsync -avz "$OLD_VPS:$REMOTE_PATH/sessao/" "$BACKUP_TMP/sessao/"
rsync -avz "$OLD_VPS:$REMOTE_PATH/data/" "$BACKUP_TMP/data/"
rsync -avz "$OLD_VPS:$REMOTE_PATH/.env" "$BACKUP_TMP/.env"

echo "3/4 📤 Enviando para a nova VPS ($NEW_VPS)..."
ssh "$NEW_VPS" "mkdir -p $REMOTE_PATH/sessao $REMOTE_PATH/data $REMOTE_PATH/logs $REMOTE_PATH/temp $REMOTE_PATH/backups"
rsync -avz "$BACKUP_TMP/sessao/" "$NEW_VPS:$REMOTE_PATH/sessao/"
rsync -avz "$BACKUP_TMP/data/" "$NEW_VPS:$REMOTE_PATH/data/"
rsync -avz "$BACKUP_TMP/.env" "$NEW_VPS:$REMOTE_PATH/.env"

rm -rf "$BACKUP_TMP"

echo "4/4 🚀 Iniciando container na nova VPS..."
ssh "$NEW_VPS" "cd $REMOTE_PATH && (docker compose up -d || docker compose -f docker-compose.lite.yml up -d)"

echo "=================================================="
echo "✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!"
echo "O bot já deve estar conectado na nova VPS sem pedir QR Code."
echo "Para verificar os logs na nova VPS:"
echo "   ssh $NEW_VPS 'docker logs -f goat_bot_xp'"
echo "=================================================="

