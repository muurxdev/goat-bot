const { q, getDatabase } = require('../connection')

function getUserCrafts(jid) {
    const db = getDatabase()
    const rows = q('SELECT item_nome FROM crafts WHERE jid = ?').all(jid)
    return rows.map(r => r.item_nome)
}

function addCraft(jid, itemNome) {
    const db = getDatabase()
    q('INSERT OR IGNORE INTO crafts (jid, item_nome) VALUES (?, ?)').run(jid, itemNome)
}

function getAllCrafts() {
    const db = getDatabase()
    const rows = q('SELECT jid, item_nome FROM crafts').all()
    const result = {}
    for (const row of rows) {
        if (!result[row.jid]) result[row.jid] = []
        result[row.jid].push(row.item_nome)
    }
    return result
}

module.exports = {
    getUserCrafts,
    addCraft,
    getAllCrafts
}

