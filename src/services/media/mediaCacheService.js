/**
 * Media Cache Service
 * Cache persistente em disco para downloads de mídia (áudio e vídeo).
 * Evita downloads repetidos, acelera entregas recorrentes (<50ms) e reduz consumo de banda.
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')

const CACHE_DIR = path.join(tempDir, 'media_cache')
const TTL_MS = 3 * 60 * 60 * 1000 // 3 horas de retenção

function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true })
    }
}

// Versão da regra de qualidade. Muda quando o que se baixa muda: em 2026-09-21
// a regra passou a ser "maior resolução existente" e o cache antigo devolvia
// o arquivo de antes (1080p H.264, TikTok 576p) para o mesmo link.
const VERSAO_QUALIDADE = 'q2'

function makeCacheKey(queryOrUrl, format = 'mp3', quality = 'default') {
    const raw = `${VERSAO_QUALIDADE}_${String(queryOrUrl).trim().toLowerCase()}_${String(format).toLowerCase()}_${String(quality).toLowerCase()}`
    return crypto.createHash('sha256').update(raw).digest('hex')
}

/**
 * Busca item no cache
 * @param {string} queryOrUrl
 * @param {string} [format='mp3']
 * @param {string} [quality='default']
 * @returns {{ filePath: string, meta: object } | null}
 */
function get(queryOrUrl, format = 'mp3', quality = 'default') {
    try {
        ensureCacheDir()
        const key = makeCacheKey(queryOrUrl, format, quality)
        const metaPath = path.join(CACHE_DIR, `${key}.json`)

        if (!fs.existsSync(metaPath)) return null

        const metaStr = fs.readFileSync(metaPath, 'utf8')
        const meta = JSON.parse(metaStr)
        const filePath = path.join(CACHE_DIR, `${key}.${meta.ext || format}`)

        if (!fs.existsSync(filePath)) return null

        const stat = fs.statSync(filePath)
        if (stat.size === 0) return null

        const age = Date.now() - (meta.cachedAt || 0)
        if (age > TTL_MS) {
            try { fs.unlinkSync(filePath) } catch (e) { logger.warn(`[MEDIA CACHE] Falha ao remover arquivo expirado: ${e.message}`) }
            try { fs.unlinkSync(metaPath) } catch (e) { logger.warn(`[MEDIA CACHE] Falha ao remover meta expirado: ${e.message}`) }
            return null
        }

        // Atualiza timestamp de último acesso
        meta.lastAccessedAt = Date.now()
        try {
            fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8')
        } catch (e) {
            logger.warn(`[MEDIA CACHE] Falha ao atualizar timestamp: ${e.message}`)
        }

        return {
            filePath,
            meta,
            size: stat.size
        }
    } catch (e) {
        logger.warn(`[MEDIA CACHE] Falha ao ler cache para "${queryOrUrl}": ${e.message}`)
        return null
    }
}

/**
 * Salva item no cache
 * @param {string} queryOrUrl
 * @param {string} format
 * @param {string} quality
 * @param {string} sourceFilePath
 * @param {object} metadata
 */
function set(queryOrUrl, format = 'mp3', quality = 'default', sourceFilePath, metadata = {}) {
    try {
        if (!sourceFilePath || !fs.existsSync(sourceFilePath)) return null
        const stat = fs.statSync(sourceFilePath)
        if (stat.size === 0) return null

        ensureCacheDir()
        const key = makeCacheKey(queryOrUrl, format, quality)
        const ext = metadata.ext || path.extname(sourceFilePath).replace(/^\./, '') || format
        const destPath = path.join(CACHE_DIR, `${key}.${ext}`)
        const metaPath = path.join(CACHE_DIR, `${key}.json`)

        // Copia o arquivo para o cache
        fs.copyFileSync(sourceFilePath, destPath)

        const meta = {
            ...metadata,
            ext,
            size: stat.size,
            queryOrUrl,
            format,
            quality,
            cachedAt: Date.now(),
            lastAccessedAt: Date.now()
        }

        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8')
        logger.info(`[MEDIA CACHE] Salvo com sucesso (${require('../../utils/tamanho').formatarTamanho(stat.size)}): ${key}`)
        return { filePath: destPath, meta }
    } catch (e) {
        logger.warn(`[MEDIA CACHE] Falha ao salvar no cache: ${e.message}`)
        return null
    }
}

/**
 * Remove arquivos expirados do diretório de cache
 */
function cleanExpired() {
    try {
        ensureCacheDir()
        const files = fs.readdirSync(CACHE_DIR)
        const now = Date.now()

        for (const file of files) {
            if (!file.endsWith('.json')) continue
            const metaPath = path.join(CACHE_DIR, file)
            try {
                const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
                if (now - (meta.lastAccessedAt || meta.cachedAt || 0) > TTL_MS) {
                    const key = file.replace(/\.json$/, '')
                    const mediaPath = path.join(CACHE_DIR, `${key}.${meta.ext || 'mp3'}`)
                    if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath)
                    fs.unlinkSync(metaPath)
                }
            } catch (e) {
                logger.warn(`[MEDIA CACHE] Falha na limpeza de ${file}: ${e.message}`)
            }
        }
    } catch (e) {
        logger.warn(`[MEDIA CACHE] Erro geral na limpeza: ${e.message}`)
    }
}

// Limpeza a cada hora
setInterval(cleanExpired, 60 * 60 * 1000).unref()

module.exports = {
    get,
    set,
    cleanExpired,
    makeCacheKey
}

