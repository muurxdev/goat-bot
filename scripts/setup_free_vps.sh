#!/usr/bin/env bash
# ==============================================================================
# 🚀 GOAT BOT XP — SETUP AUTOMATIZADO PARA VPS (DEBIAN/UBUNTU E ARCH)
# ==============================================================================
# Este script prepara uma VPS limpa (Oracle Cloud Free, Google Cloud e2-micro,
# AWS t2.micro, Hostinger, etc.) para rodar o GOATBot perfeitamente.
#
# O que este script faz:
# 1. Detecta o gerenciador de pacotes (apt-get ou pacman).
# 2. Configura 4 GB de memória SWAP (evita travamentos de RAM em VPS de 1GB).
# 3. Atualiza pacotes do sistema.
# 4. Instala Docker e Docker Compose pelo método correto de cada distro.
# 5. Configura firewall básico (SSH na porta 22 e painel QR na porta 3000).
#
# Como rodar na VPS nova:
#   curl -fsSL https://raw.githubusercontent.com/muurxdev/GOATBot/main/scripts/setup_free_vps.sh | bash
# ==============================================================================

set -euo pipefail

echo "=================================================="
echo "⚡ INICIANDO CONFIGURAÇÃO DE VPS PARA O BOT"
echo "=================================================="

# 0. Detecção da distribuição — o restante do script depende disto
if command -v pacman &> /dev/null; then
    PKG="pacman"
elif command -v apt-get &> /dev/null; then
    PKG="apt"
else
    echo "❌ Nem apt-get nem pacman encontrados. Distro não suportada."
    exit 1
fi
echo "🔍 Gerenciador de pacotes detectado: $PKG"

# 1. Criação de 4GB de SWAP se o swap total for insuficiente
SWAP_TOTAL="$(free -m | awk '/^Swap:/ {print $2}')"
if [ "${SWAP_TOTAL:-0}" -lt 1024 ]; then
    if [ -f /swapfile ]; then
        echo "ℹ️  /swapfile já existe; pulando criação para não duplicar."
    else
        echo "📦 Criando 4 GB de Swap para garantir estabilidade de memória..."
        fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        if ! grep -q '/swapfile' /etc/fstab; then
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
        fi
        echo "✅ 4 GB de Swap ativados com sucesso!"
    fi
    # Otimizações de swap para VPS (idempotentes)
    sysctl -w vm.swappiness=20
    sysctl -w vm.vfs_cache_pressure=50
    grep -q '^vm.swappiness=' /etc/sysctl.conf || echo 'vm.swappiness=20' >> /etc/sysctl.conf
    grep -q '^vm.vfs_cache_pressure=' /etc/sysctl.conf || echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
else
    echo "ℹ️  Swap já configurado no sistema (${SWAP_TOTAL} MB)."
fi

# 2. Atualização do Sistema e ferramentas básicas
echo "🔄 Atualizando repositórios do sistema..."
if [ "$PKG" = "apt" ]; then
    apt-get update -y && apt-get install -y --no-install-recommends \
        curl git ufw ca-certificates gnupg lsb-release htop rsync
else
    pacman -Syu --noconfirm --needed \
        curl git ufw ca-certificates gnupg htop rsync
fi

# 3. Instalação do Docker e Docker Compose
# O instalador get.docker.com NÃO suporta Arch — lá o Docker vem do repositório oficial.
if ! command -v docker &> /dev/null; then
    echo "🐳 Instalando Docker..."
    if [ "$PKG" = "apt" ]; then
        curl -fsSL https://get.docker.com | sh
    else
        pacman -S --noconfirm --needed docker docker-compose
    fi
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker instalado com sucesso!"
else
    echo "ℹ️  Docker já está instalado ($(docker --version))."
fi

# 3b. Garante o plugin 'docker compose' (v2) — no Arch é um pacote separado
if ! docker compose version &> /dev/null; then
    echo "🧩 Instalando plugin docker-compose..."
    if [ "$PKG" = "apt" ]; then
        apt-get install -y docker-compose-plugin
    else
        pacman -S --noconfirm --needed docker-compose
    fi
fi

# 4. Configuração do Firewall (UFW)
echo "🛡️ Configurando portas básicas de firewall (22 SSH, 3000 Painel QR)..."
ufw allow 22/tcp || true
ufw allow 3000/tcp || true
echo "y" | ufw enable || true
systemctl enable ufw || true

# 5. Preparação da pasta do projeto
TARGET_DIR="/var/www/meliodasbotxp"
mkdir -p "$TARGET_DIR"

# 5b. Dono das pastas graváveis.
# O container roda como uid 1000 (usuário `node`). O `chown` do Dockerfile vale
# só para o filesystem da imagem: um bind mount traz o dono do HOST e sobrepõe.
# Sem isto, todo comando que escreve arquivo (play, download, figurinha,
# transcrição) morre com EACCES — e só na hora do uso, nunca no boot.
echo "🔐 Ajustando dono das pastas graváveis para o usuário do container (1000)..."
mkdir -p "$TARGET_DIR"/{data,sessao,temp,logs,backups}
chown -R 1000:1000 "$TARGET_DIR"/{data,sessao,temp,logs,backups} 2>/dev/null || true
[ -d "$TARGET_DIR/assets" ] && chown -R 1000:1000 "$TARGET_DIR/assets" 2>/dev/null || true

echo "=================================================="
echo "🎉 VPS PREPARADA COM SUCESSO!"
echo "=================================================="
echo ""
echo "📌 Próximos passos para ligar o bot:"
echo "1. Clone o repositório:"
echo "   cd /var/www/meliodasbotxp"
echo "   git clone https://github.com/muurxdev/GOATBot.git ."
echo ""
echo "2. Copie seu arquivo .env:"
echo "   nano .env"
echo ""
echo "3. Se a VPS tiver 1GB ou 2GB de RAM (ex: Google Cloud ou AWS):"
echo "   docker compose -f docker-compose.lite.yml up -d --build"
echo ""
echo "4. Se a VPS tiver bastante RAM (Oracle Cloud 4 a 24GB):"
echo "   docker compose up -d --build"
echo ""
echo "5. Veja os logs:"
echo "   docker logs -f goat_bot_xp"
echo "=================================================="
