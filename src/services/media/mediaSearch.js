/**
 * Media Search Service
 */

const { spawn } = require('child_process')
const { MEDIA_ERRORS, MEDIA_LIMITS, PLATFORMS } = require('./constants')
const { buildYtDlpArgs, getYtDlpEnv } = require('./mediaArgs')
const { toMessage, isMissingBinary } = require('./mediaErrors')
const { ranquear } = require('./searchRanker')
const logger = require('../../core/logger')

/**
 * Pesquisa faixas e vídeos no YouTube retornando uma lista de resultados estruturada
 * @param {string} query - Termo de busca
 * @param {object} options
 * @param {number} [options.limit=5]
 * @param {number} [options.timeoutMs=20000]
 * @returns {Promise<Array<object>>}
 */
async function searchMedia(query, { limit = MEDIA_LIMITS.SEARCH_LIMIT, timeoutMs = 25000, userJid = null } = {}) {
    if (!query || typeof query !== 'string' || !query.trim()) {
        const err = new Error('Termo de pesquisa inválido.')
        err.code = MEDIA_ERRORS.SEARCH_FAILED
        throw err
    }

    const cleanQuery = query.replace(/[`$\";&|<>]/g, '').trim()
    const safeLimit = Math.max(1, Math.min(10, limit))

    // 1. Busca via yt-search (endpoint público — NÃO sofre o bot-check do
    //    "Sign in to confirm you're not a bot" que o `yt-dlp ytsearch` leva).
    //    Só o DOWNLOAD do link resolvido usa yt-dlp (esse funciona com cookies).
    try {
        const yts = require('yt-search')
        const res = await yts(cleanQuery)
        // Ranqueia o POOL INTEIRO antes de cortar. Cortar primeiro descartaria
        // o resultado certo quando o YouTube o coloca em 8º — que é exatamente
        // como a busca trazia música errada.
        const pool = (res && Array.isArray(res.videos)) ? res.videos.slice(0, 25) : []
        if (pool.length > 0) {
            const candidatos = pool.map((v, idx) => ({
                id: v.videoId || `search_${idx}`,
                title: v.title || 'Sem título',
                author: (v.author && v.author.name) || 'Desconhecido',
                duration: v.seconds || 0,
                durationFormatted: v.timestamp || formatDuration(v.seconds || 0),
                thumbnail: v.thumbnail || v.image || null,
                views: v.views || 0,
                url: v.url || `https://www.youtube.com/watch?v=${v.videoId}`,
                platform: PLATFORMS.YOUTUBE,
                type: 'audio'
            }))

            const ordenados = ranquear(cleanQuery, candidatos).slice(0, safeLimit)
            const topo = ordenados[0]
            logger.info(`[MEDIA SEARCH] "${cleanQuery}" -> "${topo.title}" (${topo.author}) ` +
                `score ${topo._score}${topo._motivos.length ? ' | ' + topo._motivos.join('; ') : ''}`)
            return ordenados
        }
        logger.warn('[MEDIA SEARCH] yt-search sem resultados; tentando yt-dlp ytsearch...')
    } catch (e) {
        logger.warn(`[MEDIA SEARCH] yt-search falhou (${e.message}); fallback yt-dlp ytsearch...`)
    }

    // 2. Fallback: yt-dlp ytsearch (pode cair no bot-check em IP de datacenter).
    return ytdlpSearch(cleanQuery, safeLimit, timeoutMs, userJid)
}

function ytdlpSearch(cleanQuery, safeLimit, timeoutMs, userJid) {
    return new Promise((resolve, reject) => {
        const args = buildYtDlpArgs([
            '--dump-single-json',
            '--no-warnings',
            '--no-playlist',
            '--skip-download',
            `ytsearch${safeLimit}:${cleanQuery}`
        ], { userJid })

        let proc
        try {
            proc = spawn('yt-dlp', args, { env: getYtDlpEnv() })
        } catch (spawnErr) {
            const err = new Error(`Falha ao iniciar o yt-dlp: ${spawnErr.message}`)
            err.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
            return reject(err)
        }
        let stdoutData = ''
        let stderrData = ''

        proc.on('error', spawnErr => {
            clearTimeout(timer)
            logger.error(`[MEDIA SEARCH] Falha ao iniciar yt-dlp: ${spawnErr.message}`)
            const err = new Error(isMissingBinary(spawnErr)
                ? 'yt-dlp não encontrado no ambiente (PATH do processo).'
                : `Falha ao iniciar yt-dlp: ${spawnErr.message}`)
            err.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
            reject(err)
        })

        proc.stdout.on('data', chunk => {
            stdoutData += chunk.toString()
        })

        proc.stderr.on('data', chunk => {
            stderrData += chunk.toString()
        })

        const timer = setTimeout(() => {
            proc.kill()
            const err = new Error('Tempo limite de pesquisa excedido.')
            err.code = MEDIA_ERRORS.TIMEOUT
            reject(err)
        }, timeoutMs)

        proc.on('close', code => {
            clearTimeout(timer)
            if (code !== 0 || !stdoutData.trim()) {
                logger.warn(`[MEDIA SEARCH] Falha na pesquisa (código ${code}, signal=${proc.signalCode || 'null'}): ${stderrData || 'sem stderr'}`)
                const err = new Error(toMessage('Nenhum resultado encontrado para a busca informada.', stderrData))
                err.code = MEDIA_ERRORS.NO_RESULTS
                return reject(err)
            }

            try {
                const info = JSON.parse(stdoutData)
                const entries = info.entries || [info]

                if (!entries || entries.length === 0 || !entries[0]) {
                    const err = new Error('Nenhum resultado retornado.')
                    err.code = MEDIA_ERRORS.NO_RESULTS
                    return reject(err)
                }

                const results = entries.map((entry, idx) => ({
                    id: entry.id || `search_${idx}`,
                    views: entry.view_count || 0,
                    title: entry.title || 'Sem título',
                    author: entry.uploader || entry.channel || 'Desconhecido',
                    duration: entry.duration || 0,
                    durationFormatted: formatDuration(entry.duration || 0),
                    thumbnail: entry.thumbnail || (entry.thumbnails?.[0]?.url) || null,
                    url: entry.webpage_url || entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
                    platform: PLATFORMS.YOUTUBE,
                    type: 'audio'
                }))

                // Mesmo criterio do caminho principal: a ordem do YouTube nao
                // decide sozinha qual e o resultado certo.
                resolve(ranquear(cleanQuery, results))
            } catch (jsonErr) {
                const err = new Error('Erro ao processar dados de pesquisa.')
                err.code = MEDIA_ERRORS.SEARCH_FAILED
                reject(err)
            }
        })
    })
}

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Formata os resultados de pesquisa em texto legível para o usuário do WhatsApp
 * @param {string} query
 * @param {Array<object>} results
 * @returns {string}
 */
function formatSearchResults(query, results, { cmd = 'play', isAudio = true } = {}) {
    const tipo = isAudio ? 'o áudio' : 'o vídeo'
    let msg = `🔍 *Resultados para "${query}"*\n\n`

    results.forEach((r, i) => {
        const n = r.index || (i + 1)
        const dados = [
            r.author && r.author !== 'Desconhecido' ? r.author : null,
            r.durationFormatted && r.durationFormatted !== '—' ? r.durationFormatted : null
        ].filter(Boolean).join(' · ')
        msg += `*${n}.* ${String(r.title || 'Sem título').slice(0, 60)}\n`
        if (dados) msg += `${dados}\n`
        msg += '\n'
    })

    msg += `Para baixar ${tipo}, mande \`.${cmd} <número>\` — por exemplo, \`.${cmd} 1\`.\n`
    msg += `A lista vale por 5 minutos.`
    return msg.trim()
}

module.exports = {
    searchMedia,
    formatSearchResults,
    formatDuration
}

