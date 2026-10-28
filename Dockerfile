# ==========================================
# 🐳 GOAT BOT XP — DOCKERFILE DE PRODUÇÃO
# ==========================================

FROM node:22-bookworm-slim

# Instala dependências de sistema necessárias (FFmpeg, yt-dlp, Python, curl, unzip)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    ca-certificates \
    qpdf \
    unzip \
    chromium \
    fonts-liberation \
    tzdata \
    && curl -L https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && pip3 install --break-system-packages -U "yt-dlp[default,curl-cffi]" curl_cffi \
    && rm -rf /var/lib/apt/lists/*

# Configuração de fuso horário brasileiro (UTC-3)
ENV TZ=America/Sao_Paulo \
    CHROMIUM_PATH=/usr/bin/chromium \
    PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /app

# Copia arquivos de definição de dependências
COPY package*.json ./

# Instala dependências de produção
RUN npm ci --omit=dev

# Copia o código-fonte
COPY . .

# Instala o plugin de PO Token Provider (bgutil) para o yt-dlp,
# usado no bypass do bloqueio "Sign in to confirm you're not a bot"
RUN mkdir -p ytdlp_plugins \
    && curl -L https://github.com/Brainicism/bgutil-ytdlp-pot-provider/releases/latest/download/bgutil-ytdlp-pot-provider.zip -o ytdlp_plugins/bgutil-ytdlp-pot-provider.zip \
    && cd ytdlp_plugins && unzip -o bgutil-ytdlp-pot-provider.zip && cd .. \
    && ls -la ytdlp_plugins/yt_dlp_plugins/extractor/

# Configura yt-dlp: habilita node como JS runtime + remote EJS scripts, e liga
# o plugin de PO Token. Sem --plugin-dirs o yt-dlp chamado direto não acha o
# plugin instalado acima ("PO Token Providers: none") e sem o base_url ele
# procura o gerador em 127.0.0.1, que dentro deste container não é o bgutil.
# Atenção: em 2026-09-15 isso NÃO resolveu o "Sign in to confirm you're not a
# bot" — os vídeos barrados continuaram barrados com e sem o plugin. O bloqueio
# acompanhou os cookies do YouTube incompletos (sem LOGIN_INFO/SID/SAPISID).
RUN mkdir -p /etc/yt-dlp \
    && printf '%s\n' '--js-runtimes node' '--remote-components ejs:github' \
       '--plugin-dirs /app/ytdlp_plugins' \
       '--extractor-args youtubepot-bgutilhttp:base_url=http://bgutil_pot_provider:4416' > /etc/yt-dlp/config

# Garante criação e permissões dos diretórios de dados e sessão
RUN mkdir -p data sessao temp logs \
    && chown -R node:node /app

# Executa com usuário não-privilegiado para segurança
USER node

# Healthcheck interno
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node scripts/healthcheck.js || exit 1

EXPOSE 3000

CMD ["node", "src/index.js"]

