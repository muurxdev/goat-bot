/**
 * Dynamic Bot Configuration & Identity
 */
const logger = require('../core/logger')
const { getDatabase } = require("../database/connection")

const DEFAULT_BOT_NAME = process.env.BOT_NAME || "GOAT"

function getBotName() {
    try {
        const db = getDatabase()
        const row = db.prepare("SELECT settings FROM configs WHERE group_jid = ?").get("global_bot_name")
        if (row && row.settings) {
            const parsed = JSON.parse(row.settings)
            if (parsed && typeof parsed.name === "string" && parsed.name.trim()) {
                return parsed.name.trim()
            }
        }
    } catch (errIgnorado) { logger.warn(`[BOTCONFIG] Falha ignorada em src/config/botConfig.js:18: ${errIgnorado.message}`) }
    return DEFAULT_BOT_NAME
}

function setBotName(newName) {
    if (!newName || typeof newName !== 'string') return false
    try {
        const db = getDatabase()
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO configs (group_jid, antilink, settings, updated_at)
            VALUES ('global_bot_name', 0, ?, CURRENT_TIMESTAMP)
        `)
        stmt.run(JSON.stringify({ name: newName.trim() }))
        return true
    } catch (err) {
        return false
    }
}

module.exports = {
    DEFAULT_BOT_NAME,
    getBotName,
    setBotName
}