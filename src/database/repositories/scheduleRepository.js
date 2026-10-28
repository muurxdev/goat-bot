/**
 * Bot Lifecycle Schedule Repository
 * Persistência relacional em SQLite para agendamentos de ciclo de vida e estado operacional
 */

const { getDatabase, q } = require('../connection')
const logger = require('../../core/logger')

function createSchedule({ id, action, executeAt, reopenAt = null, mode, status = 'PENDING', createdBy = 'OWNER' }) {
    const db = getDatabase()
    q(`
        INSERT INTO bot_schedules (id, action, execute_at, reopen_at, mode, status, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            action = excluded.action,
            execute_at = excluded.execute_at,
            reopen_at = excluded.reopen_at,
            mode = excluded.mode,
            status = excluded.status,
            created_by = excluded.created_by,
            updated_at = CURRENT_TIMESTAMP
    `).run(id, action, executeAt, reopenAt, mode, status, createdBy)
    logger.info(`[SCHEDULE_CREATED] Agendamento ${id} criado (${action}, modo: ${mode}, status: ${status})`)
}

function getActiveSchedules() {
    return q(`
        SELECT id, action, execute_at, reopen_at, mode, status, created_by, created_at
        FROM bot_schedules
        WHERE status IN ('PENDING', 'EXECUTING')
        ORDER BY execute_at ASC
    `).all()
}

function getSchedule(id) {
    const db = getDatabase()
    return q('SELECT * FROM bot_schedules WHERE id = ?').get(id) || null
}

function updateScheduleStatus(id, status) {
    const db = getDatabase()
    q('UPDATE bot_schedules SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id)
    logger.info(`[SCHEDULE_UPDATED] Agendamento ${id} atualizado para status: ${status}`)
}

function cancelPendingSchedules() {
    const db = getDatabase()
    const result = q(`
        UPDATE bot_schedules
        SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP
        WHERE status IN ('PENDING', 'EXECUTING')
    `).run()
    logger.info(`[SCHEDULE_CANCELLED] ${result.changes} agendamentos pendentes cancelados.`)
    return result.changes
}

function getOperationalState() {
    const db = getDatabase()
    const row = q("SELECT value FROM bot_state WHERE key = 'operational_state'").get()
    return row ? row.value : 'ONLINE'
}

function setOperationalState(newState) {
    const db = getDatabase()
    q(`
        INSERT INTO bot_state (key, value, updated_at)
        VALUES ('operational_state', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = CURRENT_TIMESTAMP
    `).run(newState)
    logger.info(`[BOT_STATE] Estado operacional alterado para: ${newState}`)
}

module.exports = {
    createSchedule,
    getActiveSchedules,
    getSchedule,
    updateScheduleStatus,
    cancelPendingSchedules,
    getOperationalState,
    setOperationalState
}

