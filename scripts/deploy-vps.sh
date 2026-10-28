#!/usr/bin/env bash
# ==========================================
# 🚀 GOAT BOT XP — DEPLOY NA VPS (pacote do commit + rebuild Docker)
# ==========================================
#
# Empacota o commit atual (git archive), envia por scp e roda
# scripts/remote/deploy-remote.sh na VPS: backup do código anterior, extração e
# rebuild. Não depende do GitHub. .env, sessão e banco ficam como estão.
# Versão Windows: scripts/deploy-vps.ps1.
#
# Uso:
#   ./scripts/deploy-vps.sh [alvo-ssh] [--push]
#     alvo-ssh : host/alias do SSH (padrão: "vps", definido no ~/.ssh/config)
#     --push   : também faz `git push origin HEAD` antes
#
set -euo pipefail

TARGET="vps"
DO_PUSH=0
for arg in "$@"; do
    case "$arg" in
        --push) DO_PUSH=1 ;;
        -h|--help) sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
        *) TARGET="$arg" ;;
    esac
done

cd "$(dirname "$0")/.."
VERSAO=$(git log -1 --format='%h %cs')
PACOTE=$(mktemp -t goat-deploy.XXXXXX)
trap 'rm -f "$PACOTE"' EXIT

echo "=================================================="
echo "🚀 Deploy GOATBot → $TARGET (commit $VERSAO)"
echo "=================================================="
[ -z "$(git status --porcelain)" ] || echo "⚠️  Há alterações não commitadas; elas NÃO vão no deploy."

if [ "$DO_PUSH" = "1" ]; then
    git push origin HEAD
fi

git archive --format=tar.gz -o "$PACOTE" HEAD
scp -q "$PACOTE" "$TARGET:/tmp/goat-deploy.tar.gz"
tr -d '\r' < scripts/remote/deploy-remote.sh | ssh "$TARGET" "bash -s -- /tmp/goat-deploy.tar.gz '$VERSAO'"
