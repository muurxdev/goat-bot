/**
 * Media Engine Constants & Error Enums
 */

const PLATFORMS = {
    YOUTUBE: 'youtube',
    INSTAGRAM: 'instagram',
    TIKTOK: 'tiktok',
    KWAI: 'kwai',
    TWITTER: 'twitter',
    REDDIT: 'reddit',
    PINTEREST: 'pinterest',
    FACEBOOK: 'facebook',
    GENERIC: 'generic'
}

const MEDIA_TYPES = {
    AUDIO: 'audio',
    VIDEO: 'video',
    IMAGE: 'image',
    GALLERY: 'gallery'
}

const FORMATS = {
    MP3: 'mp3',
    M4A: 'm4a',
    MP4: 'mp4'
}

const QUALITIES = {
    // BEST (padrao) = maior resolucao e maior fps que a plataforma tiver, com
    // H.264 apenas como DESEMPATE entre formatos da mesma resolucao. Desde
    // 2026-09-20 nao ha mais teto de 1080p: o dono pediu a maior qualidade
    // existente, e quem nao cabe na galeria vai como arquivo, sem recodificar.
    BEST: 'best',
    // MAX = igual ao BEST, mas sem nenhuma preferencia de codec.
    MAX: 'max',
    // HD = apelido historico de BEST (".play hd"). Mantido para quem ja digita.
    HD: 'hd',
    P1080: '1080p',
    P720: '720p',
    P480: '480p',
    P360: '360p'
}

const MEDIA_ERRORS = {
    INVALID_URL: 'INVALID_URL',
    UNSUPPORTED_PLATFORM: 'UNSUPPORTED_PLATFORM',
    SEARCH_FAILED: 'SEARCH_FAILED',
    NO_RESULTS: 'NO_RESULTS',
    MEDIA_NOT_FOUND: 'MEDIA_NOT_FOUND',
    FORMAT_UNAVAILABLE: 'FORMAT_UNAVAILABLE',
    DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
    PROCESSING_FAILED: 'PROCESSING_FAILED',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    DURATION_TOO_LONG: 'DURATION_TOO_LONG',
    TIMEOUT: 'TIMEOUT',
    UPLOAD_FAILED: 'UPLOAD_FAILED',
    CANCELLED: 'CANCELLED',
    SECURITY_VIOLATION: 'SECURITY_VIOLATION',
    EXECUTABLE_NOT_FOUND: 'EXECUTABLE_NOT_FOUND'
}

/**
 * Interpreta valores de milissegundos vindos de variáveis de ambiente.
 * Ex: MEDIA_DOWNLOAD_TIMEOUT_MS=240000 -> 240000. Inválido/ausente -> fallback.
 * @param {string} value
 * @param {number} fallback
 * @returns {number}
 */
function parseEnvMs(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback
    const n = Number(value)
    return Number.isFinite(n) && n > 0 ? n : fallback
}

// Núcleos do servidor: decide até que resolução vale a pena pedir. Converter 4K (AV1/VP9) para
// H.264 numa VPS de 1 vCPU leva mais de 20 min — o pedido ficava só com o ⏳ e nada chegava
// (2026-10-15). Em servidor pequeno o teto padrão é 1080p, que o YouTube entrega já em H.264 e
// vai direto para a galeria; em servidor com mais núcleos segue 4K. MEDIA_MAX_VIDEO_HEIGHT muda.
const os = require('os')
const NUCLEOS = (typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length) || 1

const MEDIA_LIMITS = {
    CPU_CORES: NUCLEOS,
    // Altura máxima (px) pedida ao baixar vídeo. Suporte total até 4320p (8K) e 2160p (4K) a 60+ fps.
    MAX_VIDEO_HEIGHT: parseEnvMs(process.env.MEDIA_MAX_VIDEO_HEIGHT, 4320),
    // Conversão para H.264 que se estima passar disto (segundos) não é feita: o original sai
    // na hora como arquivo. Melhor um arquivo agora do que a pessoa esperando 20 min por nada.
    CONVERT_MAX_ESTIMATE_S: parseEnvMs(process.env.MEDIA_CONVERT_MAX_ESTIMATE_S, 300),
    // 2000 MB (2 GB): limite máximo suportado pelo WhatsApp como documento / vídeo
    MAX_FILE_SIZE_BYTES: parseEnvMs(process.env.MEDIA_MAX_FILE_SIZE_BYTES, 2000 * 1024 * 1024),
    // 50 GB: limite máximo para uploads via Google Drive de 5TB
    MAX_DRIVE_FILE_SIZE_BYTES: parseEnvMs(process.env.MEDIA_MAX_DRIVE_FILE_SIZE_BYTES, 50 * 1024 * 1024 * 1024),
    // 6 horas. O teto anterior era 60 min e recusava live/DVD/"as melhores"
    // de pagode — justamente o conteudo longo que as pessoas mais pedem.
    // Quem limita de verdade e o disco (diskGuard), nao um numero fixo aqui.
    MAX_DURATION_SECONDS: parseEnvMs(process.env.MEDIA_MAX_DURATION_SECONDS, 6 * 3600),
    MAX_GALLERY_ITEMS: 10,
    SEARCH_LIMIT: 5,
    PROCESS_TIMEOUT_MS: parseEnvMs(process.env.MEDIA_PROCESS_TIMEOUT_MS, 180000), // 3 minutos
    DOWNLOAD_TIMEOUT_MS: parseEnvMs(process.env.MEDIA_DOWNLOAD_TIMEOUT_MS, 180000), // piso: 3 minutos
    // Teto de 90 min. O tempo ja escala com a duracao (duration * 1200), mas o
    // teto de 15 min cortava o download de qualquer coisa acima de ~1h antes de
    // terminar — o arquivo chegava truncado ou nao chegava.
    MAX_DOWNLOAD_TIMEOUT_MS: parseEnvMs(process.env.MEDIA_MAX_DOWNLOAD_TIMEOUT_MS, 90 * 60 * 1000),
    METADATA_TIMEOUT_MS: parseEnvMs(process.env.MEDIA_METADATA_TIMEOUT_MS, 30000), // 30 segundos
    MAX_CONCURRENT_DOWNLOADS: 3
}

module.exports = {
    PLATFORMS,
    MEDIA_TYPES,
    FORMATS,
    QUALITIES,
    MEDIA_ERRORS,
    MEDIA_LIMITS,
    parseEnvMs
}

