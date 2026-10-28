/**
 * Repositório de Segurança e Blacklist (SQLite)
 */

const { q, getDatabase } = require('../connection')

function isBlacklisted(jid) {
    if (!jid) return false
    const db = getDatabase()
    const row = q('SELECT jid FROM blacklist WHERE jid = ?').get(jid)
    return !!row
}

function addBlacklist(jid, motivo = 'Violação das diretrizes', autor = 'Dono') {
    const db = getDatabase()
    q(`
        INSERT OR REPLACE INTO blacklist (jid, motivo, autor, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(jid, motivo, autor)
}

function removeBlacklist(jid) {
    const db = getDatabase()
    q('DELETE FROM blacklist WHERE jid = ?').run(jid)
}

function getBlacklist() {
    const db = getDatabase()
    return q('SELECT * FROM blacklist ORDER BY created_at DESC').all()
}

function getSetting(chave, defaultVal = null) {
    const db = getDatabase()
    const row = q('SELECT valor FROM system_settings WHERE chave = ?').get(chave)
    if (!row) return defaultVal
    try {
        return JSON.parse(row.valor)
    } catch {
        return row.valor
    }
}

function setSetting(chave, valor) {
    const db = getDatabase()
    const strVal = typeof valor === 'object' ? JSON.stringify(valor) : String(valor)
    q(`
        INSERT OR REPLACE INTO system_settings (chave, valor, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(chave, strVal)
}

module.exports = {
    isBlacklisted,
    addBlacklist,
    removeBlacklist,
    getBlacklist,
    getSetting,
    setSetting
}

