/**
 * Permission & Hierarchy Repository
 * Persistência relacional em SQLite para roles, restrições de DM, status e lista trust
 */

const { q, getDatabase } = require('../connection')
const logger = require('../../core/logger')

// ══════════════════════════════════════════
// 👑 CARGOS E HIERARQUIA (user_roles)
// ══════════════════════════════════════════

function getUserRole(jid) {
    const db = getDatabase()
    const row = q('SELECT role, assigned_by, assigned_at FROM user_roles WHERE jid = ?').get(jid)
    return row || null
}

function setUserRole(jid, role, assignedBy = 'SYSTEM') {
    const db = getDatabase()
    q(`
        INSERT INTO user_roles (jid, role, assigned_by, assigned_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(jid) DO UPDATE SET
            role = excluded.role,
            assigned_by = excluded.assigned_by,
            assigned_at = CURRENT_TIMESTAMP
    `).run(jid, role.toUpperCase(), assignedBy)
    logger.info(`[PERMISSIONS] Cargo ${role.toUpperCase()} atribuído a ${jid} por ${assignedBy}`)
}

function removeUserRole(jid) {
    const db = getDatabase()
    const result = q('DELETE FROM user_roles WHERE jid = ?').run(jid)
    return result.changes > 0
}

function getAllUserRoles() {
    const db = getDatabase()
    return q('SELECT jid, role, assigned_by, assigned_at FROM user_roles').all()
}

// ══════════════════════════════════════════
// 🚫 RESTRIÇÃO DE DM / PRIVADO (.bandm)
// ══════════════════════════════════════════

function isDmBlocked(jid) {
    const db = getDatabase()
    const row = q('SELECT blocked FROM dm_restrictions WHERE jid = ?').get(jid)
    return row ? Boolean(row.blocked) : false
}

function getDmRestriction(jid) {
    const db = getDatabase()
    const row = q('SELECT jid, blocked, reason, blocked_by, created_at FROM dm_restrictions WHERE jid = ?').get(jid)
    return row || null
}

function setDmBlocked(jid, blocked = true, reason = 'Sem motivo especificado', blockedBy = 'OWNER') {
    const db = getDatabase()
    if (blocked) {
        q(`
            INSERT INTO dm_restrictions (jid, blocked, reason, blocked_by, created_at)
            VALUES (?, 1, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(jid) DO UPDATE SET
                blocked = 1,
                reason = excluded.reason,
                blocked_by = excluded.blocked_by,
                created_at = CURRENT_TIMESTAMP
        `).run(jid, reason, blockedBy)
        logger.info(`[SECURITY] DM bloqueada para ${jid} por ${blockedBy}. Motivo: ${reason}`)
    } else {
        q('DELETE FROM dm_restrictions WHERE jid = ?').run(jid)
        logger.info(`[SECURITY] DM desbloqueada para ${jid}`)
    }
}

function getAllDmBlocked() {
    const db = getDatabase()
    return q('SELECT jid, reason, blocked_by, created_at FROM dm_restrictions WHERE blocked = 1').all()
}

// ══════════════════════════════════════════
// 🔕 RESTRIÇÃO DE STATUS (.banstatus)
// ══════════════════════════════════════════

function isStatusBlocked(jid) {
    const db = getDatabase()
    const row = q('SELECT blocked FROM status_restrictions WHERE jid = ?').get(jid)
    return row ? Boolean(row.blocked) : false
}

function setStatusBlocked(jid, blocked = true, reason = 'Sem motivo especificado', blockedBy = 'OWNER') {
    const db = getDatabase()
    if (blocked) {
        q(`
            INSERT INTO status_restrictions (jid, blocked, reason, blocked_by, created_at)
            VALUES (?, 1, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(jid) DO UPDATE SET
                blocked = 1,
                reason = excluded.reason,
                blocked_by = excluded.blocked_by,
                created_at = CURRENT_TIMESTAMP
        `).run(jid, reason, blockedBy)
        logger.info(`[SECURITY] Restrição de status aplicada a ${jid} por ${blockedBy}. Motivo: ${reason}`)
    } else {
        q('DELETE FROM status_restrictions WHERE jid = ?').run(jid)
        logger.info(`[SECURITY] Restrição de status removida para ${jid}`)
    }
}

function getAllStatusBlocked() {
    const db = getDatabase()
    return q('SELECT jid, reason, blocked_by, created_at FROM status_restrictions WHERE blocked = 1').all()
}

// ══════════════════════════════════════════
// 🤝 USUÁRIOS CONFIÁVEIS (.trust)
// ══════════════════════════════════════════

function isTrusted(jid) {
    const db = getDatabase()
    const row = q('SELECT jid FROM trust_list WHERE jid = ?').get(jid)
    return Boolean(row)
}

function setTrusted(jid, trusted = true, addedBy = 'OWNER', notes = '') {
    const db = getDatabase()
    if (trusted) {
        q(`
            INSERT INTO trust_list (jid, added_by, notes, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(jid) DO UPDATE SET
                added_by = excluded.added_by,
                notes = excluded.notes,
                created_at = CURRENT_TIMESTAMP
        `).run(jid, addedBy, notes)
        logger.info(`[PERMISSIONS] ${jid} adicionado à lista TRUSTED por ${addedBy}`)
    } else {
        q('DELETE FROM trust_list WHERE jid = ?').run(jid)
        logger.info(`[PERMISSIONS] ${jid} removido da lista TRUSTED`)
    }
}

function getAllTrusted() {
    const db = getDatabase()
    return q('SELECT jid, added_by, notes, created_at FROM trust_list').all()
}

module.exports = {
    getUserRole,
    setUserRole,
    removeUserRole,
    getAllUserRoles,
    isDmBlocked,
    getDmRestriction,
    setDmBlocked,
    getAllDmBlocked,
    isStatusBlocked,
    setStatusBlocked,
    getAllStatusBlocked,
    isTrusted,
    setTrusted,
    getAllTrusted
}

