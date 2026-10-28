/**
 * Informação de mídia — o que o bot aceita, quanto pesa e por que falhou.
 *
 * Os comandos de download já existem; o que faltava era responder as perguntas
 * que aparecem quando algo dá errado: "por que não baixou?", "qual qualidade
 * cabe?", "quanto vai pesar?", "esse site é suportado?". Este serviço junta os
 * limites reais do bot, o estado das ferramentas externas e as contas de
 * tamanho — tudo lido da própria configuração, não de valores inventados.
 */

const fs = require('fs')
const path = require('path')
const logger = require('../core/logger')

const RAIZ = path.join(__dirname, '..', '..')

/** Taxas típicas por qualidade, em kbps. Base dos cálculos de tamanho. */
const TAXAS_AUDIO = {
    '64': { nome: 'Rádio AM', uso: 'voz, podcast simples' },
    '128': { nome: 'Padrão', uso: 'música no celular' },
    '192': { nome: 'Boa', uso: 'música com fone' },
    '256': { nome: 'Alta', uso: 'música com equipamento bom' },
    '320': { nome: 'Máxima', uso: 'o teto do formato comprimido' }
}

const TAXAS_VIDEO = {
    '360p': { kbps: 800, nome: 'Baixa', uso: 'economizar dados' },
    '480p': { kbps: 1500, nome: 'Média', uso: 'assistir no celular' },
    '720p': { kbps: 3000, nome: 'Alta', uso: 'padrão de qualidade' },
    '1080p': { kbps: 6000, nome: 'Full HD', uso: 'tela grande' },
    '1440p': { kbps: 12000, nome: 'Quad HD', uso: 'monitor grande' },
    '2160p': { kbps: 25000, nome: '4K', uso: 'televisão grande' }
}

/** Formatos e para que cada um serve. */
const FORMATOS = {
    audio: [
        ['mp3', 'Toca em tudo. A escolha segura.'],
        ['m4a', 'Melhor qualidade no mesmo tamanho, aceito na maioria dos aparelhos.'],
        ['opus', 'O formato do próprio WhatsApp para áudio de voz.'],
        ['wav', 'Sem compressão. Ocupa muito espaço.'],
        ['flac', 'Sem perda de qualidade, mas arquivos grandes.']
    ],
    video: [
        ['mp4', 'Toca em tudo. A escolha segura.'],
        ['webm', 'Menor, mas nem todo aparelho toca.'],
        ['mkv', 'Aceita várias faixas, ruim para WhatsApp.'],
        ['gif', 'Sem som e pesado. Prefira vídeo curto.']
    ],
    imagem: [
        ['jpg', 'Fotos. Comprime bem, perde um pouco de qualidade.'],
        ['png', 'Transparência e desenhos. Mais pesado.'],
        ['webp', 'O formato das figurinhas do WhatsApp.'],
        ['avif', 'Mais moderno e menor, suporte ainda irregular.']
    ]
}

/** Proporções de tela comuns. */
const PROPORCOES = {
    '16:9': 'vídeo horizontal padrão',
    '9:16': 'vídeo vertical (stories, reels)',
    '4:3': 'formato antigo de televisão',
    '1:1': 'quadrado (feed, figurinha)',
    '21:9': 'cinema ultrawide',
    '3:2': 'foto de câmera'
}

/** Sites que os provedores do bot sabem tratar, lidos da pasta de provedores. */
function sitesSuportados() {
    try {
        const dir = path.join(RAIZ, 'src', 'services', 'media', 'providers')
        return fs.readdirSync(dir)
            .filter(f => f.endsWith('.js') && !/baseProvider|generic/.test(f))
            .map(f => f.replace('.js', '').replace('Browser', ''))
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort()
    } catch (err) {
        logger.warn(`[MIDIA] Não consegui listar os provedores: ${err.message}`)
        return []
    }
}

/** Limites configurados do bot, lidos das constantes de mídia. */
function limites() {
    try {
        const c = require('./media/constants')
        return c.MEDIA_LIMITS || {}
    } catch (err) {
        logger.warn(`[MIDIA] Limites indisponíveis: ${err.message}`)
        return {}
    }
}

/** Ferramentas externas de que os downloads dependem. */
async function ferramentas() {
    try {
        const env = require('./media/mediaEnvCheck')
        const [ytdlp, ffmpeg] = await Promise.all([
            typeof env.isYtDlpAvailable === 'function' ? env.isYtDlpAvailable() : null,
            typeof env.isFfmpegAvailable === 'function' ? env.isFfmpegAvailable() : null
        ])
        return { ytdlp: !!ytdlp, ffmpeg: !!ffmpeg }
    } catch (err) {
        logger.warn(`[MIDIA] Verificação de ferramentas falhou: ${err.message}`)
        return { ytdlp: null, ffmpeg: null, erro: err.message }
    }
}

/** Situação da fila de mídia. */
function fila() {
    try {
        const { mediaQueue } = require('./mediaQueue')
        if (!mediaQueue) return null
        // A fila expõe getStats/getStatus; os nomes soltos (size, running) não
        // existem nesta implementação e vinham sempre nulos.
        const stats = typeof mediaQueue.getStats === 'function' ? mediaQueue.getStats() : {}
        return {
            aguardando: mediaQueue.queue?.length ?? null,
            emAndamento: mediaQueue.activeCount ?? null,
            limite: mediaQueue.maxConcurrency ?? null,
            historico: mediaQueue.history?.length ?? null,
            stats
        }
    } catch (err) {
        logger.warn(`[MIDIA] Estado da fila indisponível: ${err.message}`)
        return null
    }
}

/** Peso da pasta temporária, onde a mídia baixada passa. */
function pesoTemporario() {
    try {
        const dir = path.join(RAIZ, 'temp')
        if (!fs.existsSync(dir)) return { existe: false, bytes: 0, arquivos: 0 }
        let bytes = 0, arquivos = 0
        for (const f of fs.readdirSync(dir)) {
            try {
                const st = fs.statSync(path.join(dir, f))
                if (st.isFile()) { bytes += st.size; arquivos++ }
            } catch { /* arquivo removido durante a varredura */ }
        }
        return { existe: true, bytes, arquivos }
    } catch (err) {
        logger.warn(`[MIDIA] Peso da pasta temporária falhou: ${err.message}`)
        return { existe: false, bytes: 0, arquivos: 0, erro: err.message }
    }
}

// ══════════════════════════════════════════════════════════════
// CÁLCULOS
// ══════════════════════════════════════════════════════════════

function tamanho(bytes) {
    return require('../utils/tamanho').formatarTamanho(Number(bytes) || 0)
}

/** Tamanho aproximado de um arquivo a partir da taxa e da duração. */
function pesoEstimado(kbps, segundos) {
    const k = Math.max(0, Number(kbps) || 0)
    const s = Math.max(0, Number(segundos) || 0)
    return (k * 1000 * s) / 8
}

/** Converte "3:45" ou "225" em segundos. */
function lerDuracao(texto) {
    const t = String(texto || '').trim()
    if (/^\d+$/.test(t)) return Number(t)
    const partes = t.split(':').map(Number)
    if (partes.some(isNaN)) return null
    if (partes.length === 2) return partes[0] * 60 + partes[1]
    if (partes.length === 3) return partes[0] * 3600 + partes[1] * 60 + partes[2]
    return null
}

function formatarDuracao(segundos) {
    const s = Math.max(0, Math.floor(Number(segundos) || 0))
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
        : `${m}:${String(r).padStart(2, '0')}`
}

/** Reduz uma proporção largura×altura à forma mais simples. */
function proporcao(largura, altura) {
    const l = Math.round(Number(largura) || 0)
    const a = Math.round(Number(altura) || 0)
    if (!l || !a) return null
    const mdc = (x, y) => y ? mdc(y, x % y) : x
    const d = mdc(l, a)
    return { texto: `${l / d}:${a / d}`, largura: l, altura: a, orientacao: l > a ? 'horizontal' : l < a ? 'vertical' : 'quadrado' }
}

/** Redimensiona mantendo a proporção original. */
function redimensionar(largura, altura, novaLargura) {
    const l = Number(largura) || 0, a = Number(altura) || 0, n = Number(novaLargura) || 0
    if (!l || !a || !n) return null
    return { largura: n, altura: Math.round((a / l) * n) }
}

module.exports = {
    TAXAS_AUDIO,
    TAXAS_VIDEO,
    FORMATOS,
    PROPORCOES,
    sitesSuportados,
    limites,
    ferramentas,
    fila,
    pesoTemporario,
    tamanho,
    pesoEstimado,
    lerDuracao,
    formatarDuracao,
    proporcao,
    redimensionar
}
