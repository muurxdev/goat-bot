# GOATBOT — Docker & VPS Hostinger Deployment Guide

Manual de infraestrutura e orquestração de produção com Docker, Docker Compose e PM2.

---

## 1. Topologia de Implantação

```text
Hostinger VPS (Ubuntu / Debian)
├── 📦 Docker Engine / Docker Compose
│   └── 🐳 goat_bot_xp (Non-Root User node, Node 22 slim, FFmpeg, yt-dlp)
│       ├── 📂 ./data:/app/data (SQLite Database persistente)
│       ├── 📂 ./sessao:/app/sessao (Credenciais do Baileys persistentes)
│       ├── 📂 ./backups:/app/backups (Snapshots de recuperação)
│       └── 📂 ./logs:/app/logs (Logs de saída estruturados)
└── ⚡ PM2 Alternative (Process Manager com auto-restart em 450MB)
```

---

## 2. Inicialização em Produção

### Opção A: Via Docker Compose (Recomendado)
```bash
# Build e execução em segundo plano
docker compose up -d --build

# Visualizar logs e QR Code de autenticação
docker compose logs -f goat-bot
```

### Opção B: Via PM2 (Deploy Direto no Host)
```bash
# Executar script automatizado de deploy
./scripts/deploy.sh

# Acompanhar logs
pm2 logs goat-bot
```

