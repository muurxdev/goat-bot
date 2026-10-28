/**
 * Figurinhas de evento — a figurinha que acompanha banimento, promoção,
 * boas-vindas e outros momentos do grupo.
 *
 * Quem escolhe as figurinhas é o dono (.figurinhaevento), respondendo a uma
 * figurinha, imagem ou GIF no próprio WhatsApp. Elas ficam em
 * assets/figurinhas/<evento>/ e o bot sorteia uma a cada evento.
 *
 * O bot não traz figurinhas de fábrica: a arte que o projeto tem são
 * wallpapers de fã assinados, que nem viram figurinha boa nem são nossos para
 * recortar. Sem figurinha cadastrada, o evento sai só com o texto.
 *
 * Há um intervalo mínimo por grupo e evento: numa remoção em massa sairia uma
 * figurinha por pessoa removida.
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const dataService = require('./dataService')
const logger = require('../core/logger')

const EVENTOS = Object.freeze({
    banimento: { rotulo: 'Banimento', emoji: '👢', apelidos: ['ban', 'kick', 'remocao', 'remover', 'expulsao'] },
    promocao: { rotulo: 'Promoção a admin', emoji: '⭐', apelidos: ['promote', 'promover', 'admin'] },
    rebaixamento: { rotulo: 'Saída da administração', emoji: '🔻', apelidos: ['demote', 'rebaixar'] },
    boasvindas: { rotulo: 'Boas-vindas', emoji: '🍺', apelidos: ['welcome', 'entrada', 'bemvindo'] },
    despedida: { rotulo: 'Despedida', emoji: '👋', apelidos: ['leave', 'saida', 'tchau'] },
    advertencia: { rotulo: 'Advertência', emoji: '⚠️', apelidos: ['warn', 'aviso'] },
    silencio: { rotulo: 'Silenciamento', emoji: '🔇', apelidos: ['mute', 'silenciar'] }
})

const MAX_POR_EVENTO = 30
const INTERVALO_MS = 30000
const ultimoEnvio = new Map()
const ultimoArquivo = new Map()

function pastaBase() {
    return process.env.FIGURINHAS_DIR || path.resolve(__dirname, '../../assets/figurinhas')
}

function pastaDo(evento) {
    return path.join(pastaBase(), evento)
}

/** "Boas-Vindas", "welcome", "BAN" → chave do evento, ou null. */
function resolverEvento(nome) {
    const n = String(nome || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s_-]/g, '')
    if (EVENTOS[n]) return n
    return Object.keys(EVENTOS).find(e => EVENTOS[e].apelidos.includes(n)) || null
}

function arquivosDo(evento) {
    try {
        return fs.readdirSync(pastaDo(evento)).filter(f => f.endsWith('.webp')).sort()
    } catch (err) {
        if (err.code !== 'ENOENT') logger.warn(`[FIGURINHA] Não li a pasta de ${evento}: ${err.message}`)
        return []
    }
}

/** Quantas figurinhas cada evento tem. */
function contagem() {
    return Object.keys(EVENTOS).map(evento => ({ evento, ...EVENTOS[evento], total: arquivosDo(evento).length }))
}

/**
 * Guarda uma figurinha (já em WebP) no evento. Repetida não entra duas vezes.
 * @returns {{ ok: boolean, total?: number, motivo?: 'cheio'|'repetida' }}
 */
function salvar(evento, webpBuffer) {
    const lista = arquivosDo(evento)
    if (lista.length >= MAX_POR_EVENTO) return { ok: false, motivo: 'cheio' }

    const nome = crypto.createHash('sha1').update(webpBuffer).digest('hex').slice(0, 16) + '.webp'
    if (lista.includes(nome)) return { ok: false, motivo: 'repetida' }

    fs.mkdirSync(pastaDo(evento), { recursive: true })
    fs.writeFileSync(path.join(pastaDo(evento), nome), webpBuffer)
    return { ok: true, total: lista.length + 1 }
}

/** Apaga todas as figurinhas do evento. @returns {number} quantas apagou */
function limpar(evento) {
    let apagadas = 0
    for (const arquivo of arquivosDo(evento)) {
        try {
            fs.unlinkSync(path.join(pastaDo(evento), arquivo))
            apagadas++
        } catch (err) {
            logger.warn(`[FIGURINHA] Não apaguei ${evento}/${arquivo}: ${err.message}`)
        }
    }
    return apagadas
}

function ligadoNoGrupo(groupJid, evento) {
    const cfg = dataService.getConfigsData()[groupJid] || {}
    if (cfg.figurinhasEventos === false) return false
    if (evento === 'boasvindas' && (cfg.welcomeFigurinha === false || cfg.welcomeSticker === false)) return false
    if (evento === 'despedida' && (cfg.leaveFigurinha === false || cfg.leaveSticker === false)) return false
    return true
}

/**
 * Valida se as figurinhas em assets/figurinhas/ são 100% distintas dos wallpapers em assets/wallpapers/
 * Previne que a figurinha repita o wallpaper da mensagem automática.
 */
function verificarDiferenciacao() {
    const wpDir = path.resolve(__dirname, '../../assets/wallpapers')
    const wpFiles = fs.existsSync(wpDir) ? fs.readdirSync(wpDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png')) : []
    const wpHashes = new Set()
    for (const f of wpFiles) {
        try {
            const buf = fs.readFileSync(path.join(wpDir, f))
            wpHashes.add(crypto.createHash('md5').update(buf).digest('hex'))
        } catch (err) { logger.warn('[FIGURINHAEVENTOSERVICE] falha ignorada: ' + (err && err.message)) }
    }

    const relatorio = []
    for (const evento of Object.keys(EVENTOS)) {
        const arqs = arquivosDo(evento)
        for (const arq of arqs) {
            try {
                const buf = fs.readFileSync(path.join(pastaDo(evento), arq))
                const h = crypto.createHash('md5').update(buf).digest('hex')
                const ehIgual = wpHashes.has(h)
                relatorio.push({ evento, arquivo: arq, hash: h, colideComWallpaper: ehIgual })
                if (ehIgual) {
                    logger.error(`[FIGURINHA ALERTA] Figurinha ${evento}/${arq} colide com wallpaper!`)
                }
            } catch (err) { logger.warn('[FIGURINHAEVENTOSERVICE] falha ignorada: ' + (err && err.message)) }
        }
    }
    return {
        totalFigurinhas: relatorio.length,
        colisoes: relatorio.filter(r => r.colideComWallpaper).length,
        detalhes: relatorio
    }
}

/**
 * Manda uma figurinha sorteada do evento com rotação anti-repetição.
 * Nunca lança: figurinha é enfeite e não pode impedir o aviso do evento de chegar.
 * @param {object} client
 * @param {string} groupJid
 * @param {string} evento
 * @param {object} [opts]
 * @param {boolean} [opts.forcar] ignora o intervalo e a chave do grupo (prévia do dono)
 * @param {string} [opts.excludeWallpaper] categoria ou arquivo de wallpaper para evitar conflito
 * @returns {Promise<boolean>} se enviou
 */
async function enviar(client, groupJid, evento, { forcar = false, excludeWallpaper = null } = {}) {
    if (!client || typeof client.sendMessage !== 'function' || !EVENTOS[evento] || !groupJid) return false

    const chave = `${groupJid}|${evento}`
    const agora = Date.now()
    if (!forcar) {
        if (!ligadoNoGrupo(groupJid, evento)) return false
        if (agora - (ultimoEnvio.get(chave) || 0) < INTERVALO_MS) return false
    }

    const lista = arquivosDo(evento)
    if (!lista.length) return false

    // Rotação anti-repetição por grupo: evita sortear a mesma figurinha consecutiva
    const ultArq = ultimoArquivo.get(chave)
    let pool = lista.length > 1 ? lista.filter(f => f !== ultArq) : lista
    if (pool.length === 0) pool = lista

    const arquivoEscolhido = pool[Math.floor(Math.random() * pool.length)]
    ultimoArquivo.set(chave, arquivoEscolhido)
    if (ultimoArquivo.size > 2000) ultimoArquivo.delete(ultimoArquivo.keys().next().value)

    let buffer
    try {
        buffer = fs.readFileSync(path.join(pastaDo(evento), arquivoEscolhido))
    } catch (err) {
        logger.warn(`[FIGURINHA] Não li a figurinha de ${evento}: ${err.message}`)
        return false
    }

    if (!forcar) {
        ultimoEnvio.set(chave, agora)
        if (ultimoEnvio.size > 2000) ultimoEnvio.delete(ultimoEnvio.keys().next().value)
    }

    try {
        await client.sendMessage(groupJid, { sticker: buffer })
        return true
    } catch (err) {
        logger.warn(`[FIGURINHA] Não enviei a figurinha de ${evento} em ${groupJid}: ${err.message}`)
        return false
    }
}

module.exports = { EVENTOS, MAX_POR_EVENTO, INTERVALO_MS, resolverEvento, contagem, salvar, limpar, enviar, ligadoNoGrupo, verificarDiferenciacao }
