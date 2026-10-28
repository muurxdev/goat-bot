const { q, getDatabase } = require('../connection')

function rowToMission(row) {
    if (!row) return null
    return {
        dia: row.dia,
        progresso: Number(row.progresso || 0),
        concluida: Boolean(row.concluida),
        missao: {
            tipo: row.tipo,
            titulo: row.titulo,
            descricao: row.descricao,
            meta: Number(row.meta || 0),
            xp: Number(row.xp || 0),
            coins: Number(row.coins || 0)
        }
    }
}

function getMission(jid) {
    const db = getDatabase()
    const row = q('SELECT * FROM missions WHERE jid = ?').get(jid)
    return row ? rowToMission(row) : null
}

function saveMission(jid, data) {
    const db = getDatabase()
    const stmt = q(`
        INSERT OR REPLACE INTO missions (
            jid, dia, tipo, titulo, descricao, meta, xp, coins, progresso, concluida, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `)
    const m = data.missao || {}
    stmt.run(
        jid,
        data.dia || '',
        m.tipo || '',
        m.titulo || '',
        m.descricao || '',
        m.meta || 0,
        m.xp || 0,
        m.coins || 0,
        data.progresso || 0,
        data.concluida ? 1 : 0
    )
}

function getAllMissions() {
    const db = getDatabase()
    const rows = q('SELECT * FROM missions').all()
    const result = {}
    for (const row of rows) {
        result[row.jid] = rowToMission(row)
    }
    return result
}

module.exports = {
    getMission,
    saveMission,
    getAllMissions,
    rowToMission
}

