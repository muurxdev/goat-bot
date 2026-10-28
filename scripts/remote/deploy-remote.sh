#!/usr/bin/env bash
# Roda NA VPS. Enviado por scripts/deploy-vps.ps1 (Windows) e scripts/deploy-vps.sh (Linux).
#
# Recebe um pacote .tar.gz com o código do commit (git archive), guarda um
# backup do código atual, extrai o pacote por cima e reconstrói o container.
# Não mexe em .env, data/, sessao/, backups/, logs/ nem temp/: nada disso vai
# no pacote (são ignorados pelo git), então a sessão do WhatsApp e o banco ficam.
#
# Uso: bash -s -- /tmp/pacote.tar.gz "<commit> <mensagem>"
set -euo pipefail

PACOTE="${1:?informe o pacote .tar.gz}"
VERSAO="${2:-}"
REMOTE_DIR="/var/www/meliodasbotxp"
SERVICE="goat-bot"
CONTAINER="goat_bot_xp"
BACKUP_DIR="/root/deploy-backups"

mkdir -p "$REMOTE_DIR" "$BACKUP_DIR"
cd "$REMOTE_DIR"

if [ "$(ls -A . 2>/dev/null)" ]; then
    echo "🗃️  Backup do código atual → $BACKUP_DIR"
    BK="$BACKUP_DIR/codigo-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$BK" \
        --exclude=./data --exclude=./sessao --exclude=./backups --exclude=./logs \
        --exclude=./temp --exclude=./node_modules --exclude=./.git . 2>/dev/null || true
    echo "   $BK"
    # Mantém os 5 backups mais novos.
    ls -1t "$BACKUP_DIR"/codigo-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm -f 2>/dev/null || true
else
    BK="nenhum (instalação inicial)"
fi

# Arquivo apagado no repositório tem de sumir daqui também. Sem isto, o tar
# só acrescentava: o deploy de 2026-09-18 deixou os 330 comandos unificados
# carregando junto com os novos (5.152 no lugar de ~4.820). Só as pastas de
# código entram nesta limpeza; data/, sessao/, assets/ e .env ficam intactos.
echo "🧹 Removendo o que saiu do código…"
LISTA_NOVA=$(mktemp); LISTA_ATUAL=$(mktemp)
tar -tzf "$PACOTE" | grep -v '/$' | sed 's#^\./##' | sort > "$LISTA_NOVA"
find src scripts tests assets/figurinhas -type f 2>/dev/null | sort > "$LISTA_ATUAL"
REMOVER=$(comm -23 "$LISTA_ATUAL" "$LISTA_NOVA")
if [ -n "$REMOVER" ]; then
    echo "   $(printf '%s\n' "$REMOVER" | wc -l) arquivo(s)"
    printf '%s\n' "$REMOVER" | xargs -r -d '\n' rm -f
    find src scripts tests -type d -empty -delete 2>/dev/null || true
fi
rm -f "$LISTA_NOVA" "$LISTA_ATUAL"

echo "📦 Extraindo o pacote novo…"
# --no-overwrite-dir: pasta que já existe mantém dono e permissão.
tar -xzf "$PACOTE" -C "$REMOTE_DIR" --no-overwrite-dir
rm -f "$PACOTE"
# Cache de mídia é por texto pedido e dura 3 h: se a versão nova muda a busca,
# o resultado antigo (talvez errado) continuaria saindo. É só velocidade; limpa.
rm -rf "$REMOTE_DIR/temp/media_cache"
# O container roda como uid 1000 e grava em assets/ (bind mount, .setwallpaper).
# Extraído como root, o que chega do pacote vem com dono root e o bot perde a
# escrita — foi o que aconteceu no deploy de 2026-09-18.
chown -R 1000:1000 "$REMOTE_DIR/assets"
if [ -n "$VERSAO" ]; then
    echo "$VERSAO" > "$REMOTE_DIR/.versao-deploy"
    echo "✅ Versão: $VERSAO"
fi

echo "🐳 docker compose up -d --build $SERVICE…"
docker compose up -d --build "$SERVICE"

echo "⏳ Aguardando healthcheck…"
HEALTHY=0
for _ in $(seq 1 40); do
    H=$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo unknown)
    S=$(docker inspect -f '{{.State.Status}}' "$CONTAINER" 2>/dev/null || echo unknown)
    if [ "$H" = "healthy" ]; then HEALTHY=1; echo "💚 Container healthy."; break; fi
    if [ "$S" = "exited" ] || [ "$S" = "dead" ]; then
        echo "❌ Container em status '$S'. Últimos logs:"
        docker logs --tail 30 "$CONTAINER" 2>&1 | tail -30
        echo "↩️  Para voltar: tar -xzf $BK -C $REMOTE_DIR && docker compose up -d --build $SERVICE"
        exit 1
    fi
    sleep 5
done
[ "$HEALTHY" = "1" ] || echo "⚠️  Não ficou 'healthy' no tempo esperado — veja os logs abaixo."

echo "📄 Últimos logs do bot:"
docker logs --tail 15 "$CONTAINER" 2>&1 | tail -15
echo "=================================================="
echo "🎉 Deploy concluído. Backup anterior: $BK"
echo "=================================================="
