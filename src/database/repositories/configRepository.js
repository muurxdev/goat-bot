const { q, getDatabase } = require('../connection')

function getConfig(groupJid) {
    const db = getDatabase()
    const row = q('SELECT * FROM configs WHERE group_jid = ?').get(groupJid)
    if (!row) return {}
    const parsed = JSON.parse(row.settings || '{}')
    parsed.antilink = Boolean(row.antilink)
    return parsed
}

function saveConfig(groupJid, config) {
    const db = getDatabase()
    const stmt = q(`
        INSERT OR REPLACE INTO configs (group_jid, antilink, settings, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `)
    stmt.run(
        groupJid,
        config.antilink ? 1 : 0,
        JSON.stringify(config || {})
    )
}

function getAllConfigs() {
    const db = getDatabase()
    const rows = q('SELECT * FROM configs').all()
    const result = {}
    for (const row of rows) {
        const parsed = JSON.parse(row.settings || '{}')
        parsed.antilink = Boolean(row.antilink)
        result[row.group_jid] = parsed
    }
    return result
}

module.exports = {
    getConfig,
    saveConfig,
    getAllConfigs
}

