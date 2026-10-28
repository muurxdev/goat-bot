/**
 * Áudios de evento — a nota de voz curta que pode acompanhar banimento,
 * promoção, boas-vindas e outros momentos do grupo.
 *
 * Vem DESLIGADO por padrão (`.audiosgrupo on` liga por grupo): áudio em todo
 * evento incomoda quem está com o celular no volume, e a figurinha já dá o
 * recado. Sai no máximo um áudio por minuto em cada grupo, qualquer que seja o
 * evento.
 *
 * As frases padrão em assets/audios/<evento>/ são lidas por uma voz sintética
 * comum — não imitam o dublador original, de propósito: clonar a voz de uma
 * pessoa real sem autorização não é algo que se ponha num bot de grupo.
 * O dono pode gravar as próprias com `.audioevento`.
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const dataService = require('./dataService')
const { EVENTOS } = require('./figurinhaEventoService')
const logger = require('../core/logger')
const { paraNotaDeVoz } = require('./media/notaDeVoz')

const MAX_POR_EVENTO = 10
const INTERVALO_MS = 60000
const ultimoEnvio = new Map()

function pastaBase() {
    return process.env.AUDIOS_EVENTO_DIR || path.resolve(__dirname, '../../assets/audios')
}

function pastaDo(evento) {
    return path.join(pastaBase(), evento)
}

function arquivosDo(evento) {
    try {
        return fs.readdirSync(pastaDo(evento)).filter(f => /\.(mp3|ogg|m4a)$/i.test(f)).sort()
    } catch (err) {
        if (err.code !== 'ENOENT') logger.warn(`[AUDIO EVENTO] Não li a pasta de ${evento}: ${err.message}`)
        return []
    }
}

/** Quantos áudios cada evento tem. */
function contagem() {
    return Object.keys(EVENTOS).map(evento => ({ evento, ...EVENTOS[evento], total: arquivosDo(evento).length }))
}

/**
 * Guarda um áudio no evento.
 * @returns {{ ok: boolean, total?: number, motivo?: 'cheio'|'repetido' }}
 */
function salvar(evento, buffer, extensao = 'mp3') {
    const lista = arquivosDo(evento)
    if (lista.length >= MAX_POR_EVENTO) return { ok: false, motivo: 'cheio' }

    const nome = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 16) + '.' + extensao.replace(/[^a-z0-9]/gi, '')
    if (lista.includes(nome)) return { ok: false, motivo: 'repetido' }

    fs.mkdirSync(pastaDo(evento), { recursive: true })
    fs.writeFileSync(path.join(pastaDo(evento), nome), buffer)
    return { ok: true, total: lista.length + 1 }
}

/** Apaga os áudios gravados pelo dono, preservando o padrão do bot. */
function limpar(evento, { incluirPadrao = false } = {}) {
    let apagados = 0
    for (const arquivo of arquivosDo(evento)) {
        if (!incluirPadrao && arquivo.startsWith('padrao.')) continue
        try {
            fs.unlinkSync(path.join(pastaDo(evento), arquivo))
            apagados++
        } catch (err) {
            logger.warn(`[AUDIO EVENTO] Não apaguei ${evento}/${arquivo}: ${err.message}`)
        }
    }
    return apagados
}

/** Opt-in: só toca onde alguém ligou. */
function ligadoNoGrupo(groupJid) {
    return dataService.getConfigsData()[groupJid]?.audiosEventos === true
}

/**
 * Manda o áudio do evento como nota de voz. Nunca lança.
 * @returns {Promise<boolean>} se enviou
 */
async function enviar(client, groupJid, evento, { forcar = false } = {}) {
    if (!client || typeof client.sendMessage !== 'function' || !EVENTOS[evento] || !groupJid) return false

    const agora = Date.now()
    if (!forcar) {
        if (!ligadoNoGrupo(groupJid)) return false
        if (agora - (ultimoEnvio.get(groupJid) || 0) < INTERVALO_MS) return false
    }

    const lista = arquivosDo(evento)
    if (!lista.length) return false

    const escolhido = lista[Math.floor(Math.random() * lista.length)]
    let buffer
    try {
        buffer = fs.readFileSync(path.join(pastaDo(evento), escolhido))
    } catch (err) {
        logger.warn(`[AUDIO EVENTO] Não li o áudio de ${evento}: ${err.message}`)
        return false
    }

    if (!forcar) {
        ultimoEnvio.set(groupJid, agora)
        if (ultimoEnvio.size > 2000) ultimoEnvio.delete(ultimoEnvio.keys().next().value)
    }

    try {
        const arquivo = path.join(pastaDo(evento), escolhido)
        let mtime = 0
        try {
            mtime = fs.statSync(arquivo).mtimeMs
        } catch (err) {
            logger.warn(`[AUDIO EVENTO] Sem data do arquivo ${escolhido}: ${err.message}`)
        }
        const voz = await paraNotaDeVoz(buffer, { chave: `${arquivo}:${mtime}` })
        await client.sendMessage(groupJid, {
            audio: voz.buffer,
            mimetype: voz.mimetype,
            ptt: true
        })
        return true
    } catch (err) {
        logger.warn(`[AUDIO EVENTO] Não enviei o áudio de ${evento} em ${groupJid}: ${err.message}`)
        return false
    }
}

module.exports = { MAX_POR_EVENTO, INTERVALO_MS, contagem, salvar, limpar, enviar, ligadoNoGrupo }
