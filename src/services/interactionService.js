/**
 * Registro de INTERAÇÕES ativas (jogos/fluxos que aceitam RESPOSTA LIVRE).
 *
 * Problema que resolve: jogos como .quiz guardavam estado em memória e exigiam
 * `.quiz <resposta>` (com prefixo) — então "responder normal" no chat não valia,
 * dando a sensação de que "o quiz não funciona". Aqui um jogo registra um handler
 * por chat; o messageHandler oferece o texto livre a esse handler ANTES do
 * fallback de IA. Se o handler "consome" (retorna true), a mensagem é tratada
 * como resposta do jogo.
 *
 * Uma interação ativa por chat (igual ao Map keyed-by-`from` que os jogos já
 * usavam). TTL evita partidas presas. Estado só em memória (some no restart —
 * comportamento aceitável para partidas efêmeras).
 */

const logger = require('../core/logger')

const store = new Map() // chatJid -> { onText, expiresAt, owner, type }
const DEFAULT_TTL_MS = 120000

/**
 * Registra uma interação para um chat.
 * @param {string} chatJid
 * @param {object} entry
 * @param {(text:string, ctx:object)=>Promise<boolean>|boolean} entry.onText
 *        handler que recebe o texto livre; retorna true se CONSUMIU a mensagem.
 * @param {number} [entry.ttlMs]
 * @param {string} [entry.owner] se definido, só esse usuário responde.
 * @param {string} [entry.type] rótulo (ex.: 'quiz') para diagnóstico.
 */
function register(chatJid, { onText, ttlMs = DEFAULT_TTL_MS, owner = null, type = 'generic' }) {
    if (!chatJid || typeof onText !== 'function') return
    store.set(chatJid, { onText, expiresAt: Date.now() + ttlMs, owner, type })
}

function clear(chatJid) { store.delete(chatJid) }

function has(chatJid) {
    const e = store.get(chatJid)
    if (!e) return false
    if (Date.now() > e.expiresAt) { store.delete(chatJid); return false }
    return true
}

/**
 * Oferece o texto livre à interação ativa do chat.
 * @returns {Promise<boolean>} true se a mensagem foi consumida pelo jogo.
 */
async function consume(chatJid, userJid, text, ctx = {}) {
    const e = store.get(chatJid)
    if (!e) return false
    if (Date.now() > e.expiresAt) { store.delete(chatJid); return false }
    if (e.owner && userJid && e.owner !== userJid) return false
    try {
        const consumed = await e.onText(text, { ...ctx, chatJid, userJid, clear: () => store.delete(chatJid) })
        return !!consumed
    } catch (err) {
        logger.warn(`[INTERACTION] handler '${e.type}' falhou: ${err.message}`)
        return false
    }
}

module.exports = { register, clear, has, consume }
