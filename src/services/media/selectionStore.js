/**
 * Store de seleção de mídia (busca → escolha → download)
 *
 * Guarda os últimos resultados de busca por chat+usuário, para que o usuário
 * possa listar tudo com dados/álbum e depois baixar pelo número (ex.: `.play 2`).
 */

const store = new Map()   // key `${chat}:${user}` -> { query, results, isAudio, ts }
const TTL_MS = 5 * 60 * 1000
const MAX_ENTRIES = 500

function key(chat, user) {
    return `${chat || 'pv'}:${(user || '').split(':')[0]}`
}

function prune() {
    const now = Date.now()
    for (const [k, v] of store) {
        if (now - v.ts > TTL_MS) store.delete(k)
    }
    // teto de memória: remove os mais antigos
    if (store.size > MAX_ENTRIES) {
        const oldest = [...store.entries()].sort((a, b) => a[1].ts - b[1].ts)
        for (let i = 0; i < store.size - MAX_ENTRIES; i++) store.delete(oldest[i][0])
    }
}

function setSelection(chat, user, { query, results, isAudio = true }) {
    prune()
    store.set(key(chat, user), { query, results, isAudio, ts: Date.now() })
}

function getSelection(chat, user) {
    const v = store.get(key(chat, user))
    if (!v) return null
    if (Date.now() - v.ts > TTL_MS) { store.delete(key(chat, user)); return null }
    return v
}

/** Retorna o resultado escolhido (1-based) ou null. */
function pickSelection(chat, user, index) {
    const v = getSelection(chat, user)
    if (!v || !Array.isArray(v.results)) return null
    const i = Number(index) - 1
    if (!Number.isInteger(i) || i < 0 || i >= v.results.length) return null
    return { ...v, chosen: v.results[i], index: i + 1 }
}

function clearSelection(chat, user) {
    store.delete(key(chat, user))
}

module.exports = { setSelection, getSelection, pickSelection, clearSelection }
