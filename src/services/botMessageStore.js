/**
 * Registro leve das mensagens ENVIADAS pelo bot.
 *
 * O Baileys 7 removeu o store embutido (`makeInMemoryStore`), e o projeto nunca
 * configurou um substituto — então `client.store.loadMessages` era `undefined` e
 * o `.limparbot` quebrava sempre, em qualquer cenário. Aqui guardamos apenas as
 * CHAVES das mensagens que o próprio bot mandou, por chat, que é o suficiente
 * para apagá-las depois (o WhatsApp só precisa da key).
 *
 * Memória apenas, com teto por chat — não é histórico, é lixeira de curto prazo.
 */

const MAX_POR_CHAT = 60
const store = new Map() // chatJid -> [{ key, at }]

/** Registra a chave de uma mensagem enviada pelo bot. */
function record(chatJid, key) {
    if (!chatJid || !key || !key.id) return
    const list = store.get(chatJid) || []
    list.push({ key, at: Date.now() })
    if (list.length > MAX_POR_CHAT) list.splice(0, list.length - MAX_POR_CHAT)
    store.set(chatJid, list)
}

/** Últimas N mensagens do bot naquele chat (mais recentes primeiro). */
function recent(chatJid, n = 10) {
    const list = store.get(chatJid) || []
    return list.slice(-Math.max(1, n)).reverse().map(e => e.key)
}

/** Quantas mensagens do bot temos registradas para o chat. */
function count(chatJid) {
    return (store.get(chatJid) || []).length
}

/** Remove chaves já apagadas. */
function forget(chatJid, keys = []) {
    const ids = new Set(keys.map(k => k && k.id).filter(Boolean))
    const list = (store.get(chatJid) || []).filter(e => !ids.has(e.key.id))
    store.set(chatJid, list)
}

module.exports = { record, recent, count, forget, MAX_POR_CHAT }
