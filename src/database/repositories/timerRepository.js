/**
 * Timer Repository (SQLite WAL)
 * Gerencia a persistência de lembretes, timers e agendamentos com recuperação automática no boot
 */

const { getDatabase, q } = require('../connection');
const logger = require('../../core/logger');

function rowToTimer(row) {
    if (!row) return null;
    let metadata = {};
    try {
        metadata = JSON.parse(row.metadata || '{}');
    } catch (_) {
        metadata = {};
    }

    return {
        id: row.id,
        scopeJid: row.scope_jid,
        senderJid: row.sender_jid,
        type: row.type,
        content: row.content,
        triggerAt: Number(row.trigger_at),
        createdAt: Number(row.created_at),
        status: row.status,
        metadata
    };
}

function createTimer({ id, scopeJid, senderJid, type = 'reminder', content, triggerAt, metadata = {} }) {
    try {
        const db = getDatabase();
        const timerId = id || `timer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const now = Date.now();
        const metaStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

        q(`
            INSERT INTO persistent_timers (
                id, scope_jid, sender_jid, type, content, trigger_at, created_at, status, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
        `).run(timerId, scopeJid, senderJid || 'SYSTEM', type, content, triggerAt, now, metaStr);

        logger.info(`[TIMER REPO] Timer criado: ${timerId} (tipo: ${type}, triggerAt: ${new Date(triggerAt).toISOString()})`);
        return timerId;
    } catch (err) {
        logger.error('[TIMER REPO ERROR] Falha ao criar timer:', err);
        throw err;
    }
}

function getPendingTimers(upToTimestamp = null) {
    try {
        const db = getDatabase();
        if (upToTimestamp !== null) {
            const rows = q(`
                SELECT * FROM persistent_timers
                WHERE status = 'PENDING' AND trigger_at <= ?
                ORDER BY trigger_at ASC
            `).all(upToTimestamp);
            return rows.map(rowToTimer);
        }

        const rows = q(`
            SELECT * FROM persistent_timers
            WHERE status = 'PENDING'
            ORDER BY trigger_at ASC
        `).all();
        return rows.map(rowToTimer);
    } catch (err) {
        logger.error('[TIMER REPO ERROR] Falha ao buscar timers pendentes:', err);
        return [];
    }
}

function getTimerById(id) {
    try {
        const db = getDatabase();
        const row = q('SELECT * FROM persistent_timers WHERE id = ?').get(id);
        return rowToTimer(row);
    } catch (err) {
        logger.error(`[TIMER REPO ERROR] Falha ao buscar timer ${id}:`, err);
        return null;
    }
}

function updateTimerStatus(id, status) {
    try {
        const db = getDatabase();
        q('UPDATE persistent_timers SET status = ? WHERE id = ?').run(status, id);
        logger.debug(`[TIMER REPO] Timer ${id} atualizado para ${status}`);
        return true;
    } catch (err) {
        logger.error(`[TIMER REPO ERROR] Falha ao atualizar timer ${id}:`, err);
        return false;
    }
}

function cancelTimer(id, senderJid = null) {
    try {
        const db = getDatabase();
        if (senderJid) {
            const res = q("UPDATE persistent_timers SET status = 'CANCELLED' WHERE id = ? AND sender_jid = ? AND status = 'PENDING'").run(id, senderJid);
            return res.changes > 0;
        }
        const res = q("UPDATE persistent_timers SET status = 'CANCELLED' WHERE id = ? AND status = 'PENDING'").run(id);
        return res.changes > 0;
    } catch (err) {
        logger.error(`[TIMER REPO ERROR] Falha ao cancelar timer ${id}:`, err);
        return false;
    }
}

function cancelTimersByScopeAndType(scopeJid, type) {
    try {
        const db = getDatabase();
        const res = q("UPDATE persistent_timers SET status = 'CANCELLED' WHERE scope_jid = ? AND type = ? AND status = 'PENDING'").run(scopeJid, type);
        logger.debug(`[TIMER REPO] ${res.changes} timers cancelados para ${scopeJid} (tipo: ${type})`);
        return res.changes;
    } catch (err) {
        logger.error(`[TIMER REPO ERROR] Falha ao cancelar timers de ${scopeJid} (${type}):`, err);
        return 0;
    }
}

function getActiveTimersForUser(senderJid, scopeJid = null) {
    try {
        const db = getDatabase();
        if (scopeJid) {
            const rows = q(`
                SELECT * FROM persistent_timers
                WHERE sender_jid = ? AND scope_jid = ? AND status = 'PENDING'
                ORDER BY trigger_at ASC
            `).all(senderJid, scopeJid);
            return rows.map(rowToTimer);
        }
        const rows = q(`
            SELECT * FROM persistent_timers
            WHERE sender_jid = ? AND status = 'PENDING'
            ORDER BY trigger_at ASC
        `).all(senderJid);
        return rows.map(rowToTimer);
    } catch (err) {
        logger.error('[TIMER REPO ERROR] Falha ao listar timers de usuário:', err);
        return [];
    }
}

module.exports = {
    createTimer,
    getPendingTimers,
    getTimerById,
    updateTimerStatus,
    cancelTimer,
    cancelTimersByScopeAndType,
    getActiveTimersForUser
};
