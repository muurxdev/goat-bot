const { q, getDatabase } = require('../connection')

function getWarns(jid) {
    const db = getDatabase()
    const row = q('SELECT count FROM warns WHERE jid = ?').get(jid)
    return row ? Number(row.count) : 0
}

function setWarns(jid, count) {
    const db = getDatabase()
    const stmt = q(`
        INSERT OR REPLACE INTO warns (jid, count, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `)
    stmt.run(jid, count || 0)
}

function getAllWarns() {
    const db = getDatabase()
    const rows = q('SELECT * FROM warns').all()
    const result = {}
    for (const row of rows) {
        result[row.jid] = Number(row.count)
    }
    return result
}

module.exports = {
    getWarns,
    setWarns,
    getAllWarns
}

