# GOATBOT — Multi-Platform Media Engine

Documentação técnica da arquitetura modular do Media Engine para download, processamento e envio de mídias de múltiplas plataformas.

---

## 1. Arquitetura Modular

```text
src/services/media/
├── mediaEngine.js          # Orquestrador central, emissor de eventos e gerenciador de jobs
├── mediaResolver.js        # Validação SSRF, normalização de URLs e roteamento de provedores
├── mediaSearch.js          # Busca textual de faixas e vídeos com saída estruturada
├── mediaDownloader.js      # Gerenciamento de download via yt-dlp seguro (spawn, cancelamento e timeouts)
├── mediaProcessor.js       # Processamento e conversão de áudio/vídeo com FFmpeg
├── mediaUploader.js        # Desacoplamento do envio de mídia (áudio, vídeo, galeria) para Baileys
├── formatResolver.js       # Resolução dinâmica de formato (MP3, M4A, MP4) e qualidade (1080p..360p)
├── constants.js            # Enums de erros, limites, plataformas e formatos
└── providers/
    ├── baseProvider.js     # Classe abstrata com contratos de normalização
    ├── youtube.js          # Provedor YouTube
    ├── instagram.js        # Provedor Instagram (Reels, Posts, Galerias)
    ├── tiktok.js           # Provedor TikTok
    ├── twitter.js          # Provedor Twitter / X
    ├── reddit.js           # Provedor Reddit
    ├── pinterest.js        # Provedor Pinterest
    └── generic.js          # Fallback para URLs web genéricas
```

---

## 2. Modelo de Media Job

Toda operação é controlada por um objeto normalizado:

```javascript
{
  id: "job_1788124827371_abcde",
  userId: "5511999999999@s.whatsapp.net",
  chatId: "120363000000000099@g.us",
  source: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  platform: "youtube",
  type: "audio",               // "audio" | "video" | "gallery"
  requestedFormat: "mp3",      // "mp3" | "m4a" | "mp4"
  requestedQuality: "best",    // "best" | "1080p" | "720p" | "480p" | "360p"
  metadata: { ... },
  status: "COMPLETED",         // PENDING | ANALYZING | DOWNLOADING | PROCESSING | COMPLETED | FAILED | CANCELLED
  tempDir: "temp/media/job_1788124827371_abcde",
  createdAt: 1788124827371,
  updatedAt: 1788124830120
}
```

---

## 3. Plataformas e Provedores

| Plataforma | Provedor | Suporte de Formatos | Status de Validação |
| :--- | :--- | :--- | :--- |
| **YouTube** | `YouTubeProvider` | MP3, M4A, MP4 (1080p..360p) | `IMPLEMENTED / VALIDATED` |
| **Instagram** | `InstagramProvider` | MP4, Reels, Galerias de fotos/vídeos | `IMPLEMENTED / VALIDATED` |
| **TikTok** | `TikTokProvider` | MP4 sem marca d'água | `IMPLEMENTED / VALIDATED` |
| **Twitter / X** | `TwitterProvider` | MP4 | `IMPLEMENTED / VALIDATED` |
| **Reddit** | `RedditProvider` | MP4 com áudio sincronizado | `IMPLEMENTED / VALIDATED` |
| **Pinterest** | `PinterestProvider` | MP4, imagens | `IMPLEMENTED / VALIDATED` |
| **Genérico** | `GenericProvider` | Qualquer URL web compatível com yt-dlp | `IMPLEMENTED / VALIDATED` |

---

## 4. Segurança e Isolamento

- **Prevenção de Command Injection:** Todas as invocações de `yt-dlp` e `ffmpeg` utilizam a API `spawn` do Node.js com vetores de argumentos (`string[]`), sem interpolação em shell.
- **Prevenção de SSRF:** `validateUrl()` bloqueia explicitamente `localhost`, `127.0.0.1`, `0.0.0.0`, redes privadas RFC 1918 (`10.x`, `192.168.x`, `172.16-31.x`) e metadados de nuvem (`169.254.169.254`).
- **Isolamento de Arquivos Temporários:** Cada Job possui seu próprio subdiretório `temp/media/<jobId>/` com limpeza garantida em caso de sucesso, falha ou cancelamento (`mediaEngine.cleanup(jobId)`).

---

## 5. Limites e Políticas de Execução

```javascript
const MEDIA_LIMITS = {
    MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024, // 100 MB (limite seguro do WhatsApp)
    MAX_DURATION_SECONDS: 1800,              // 30 minutos
    MAX_GALLERY_ITEMS: 10,
    SEARCH_LIMIT: 5,
    PROCESS_TIMEOUT_MS: 120000,              // 2 minutos
    DOWNLOAD_TIMEOUT_MS: 180000,             // 3 minutos
    METADATA_TIMEOUT_MS: 25000,              // 25 segundos
    MAX_CONCURRENT_DOWNLOADS: 2
}
```

---

## 6. Eventos Emitidos (Prontos para o Live Progress Engine)

O `mediaEngine` estende `EventEmitter` e emite os seguintes eventos estruturados durante o ciclo de processamento:

```javascript
mediaEngine.on('media.search', ({ query, status, count }) => { ... })
mediaEngine.on('media.analyze', ({ input, status, metadata }) => { ... })
mediaEngine.on('media.download', ({ jobId, percent, speed, eta, size }) => { ... })
mediaEngine.on('media.process', ({ jobId, status }) => { ... })
mediaEngine.on('media.complete', ({ jobId, result }) => { ... })
mediaEngine.on('media.error', ({ jobId, error }) => { ... })
mediaEngine.on('media.cancelled', ({ jobId }) => { ... })
```

