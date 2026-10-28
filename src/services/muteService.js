/**
 * Mute Service — Gerenciamento Centralizado de Silenciamento no SQLite
 * 
 * Permite silenciar usuários em grupos por tempo determinado ou indeterminado.
 * Intercepta e apaga mensagens de usuários silenciados no messageHandler com throttling de avisos.
 */

const { getDatabase } = require('../database/connection');
const logger = require('../core/logger');

// Cache em memória de avisos de mute para evitar flood de avisos no grupo (1 aviso a cada 20s por usuário)
const _muteNotifyThrottle = new Map();
const THROTTLE_MS = 20000;

function _initTable() {
    try {
        const db = getDatabase();
        db.prepare(`
            CREATE TABLE IF NOT EXISTS muted_members (
                group_jid TEXT NOT NULL,
                user_jid TEXT NOT NULL,
                muted_by TEXT NOT NULL,
                reason TEXT DEFAULT 'Conduta inadequada ou spam',
                duration_ms INTEGER DEFAULT 0,
                expires_at INTEGER DEFAULT 0,
                created_at INTEGER NOT NULL,
                PRIMARY KEY (group_jid, user_jid)
            )
        `).run();
    } catch (err) {
        logger.error('[MUTE SERVICE] Falha ao inicializar tabela muted_members:', err.message);
    }
}

/**
 * Converte string de duração de mute em milissegundos
 * Ex: '10m', '30m', '1h', '2h', '1d', 'indefinido'
 */
function parseMuteDuration(str) {
    if (!str || typeof str !== 'string') return 15 * 60 * 1000; // 15 minutos padrão
    const clean = str.trim().toLowerCase();
    if (['inf', 'indefinido', 'permanente', 'sempre', '0'].includes(clean)) {
        return 0; // 0 = tempo indeterminado
    }
    const match = clean.match(/^(\d+)\s*(s|m|h|d)?$/);
    if (!match) return 15 * 60 * 1000;

    const val = parseInt(match[1], 10);
    const unit = match[2] || 'm';

    switch (unit) {
        case 's': return val * 1000;
        case 'm': return val * 60 * 1000;
        case 'h': return val * 60 * 60 * 1000;
        case 'd': return val * 24 * 60 * 60 * 1000;
        default: return val * 60 * 1000;
    }
}

/**
 * Formata o tempo restante de mute em texto legível
 */
function formatMuteRemaining(diffMs) {
    if (diffMs <= 0) return 'Expirado';
    const totalSegundos = Math.floor(diffMs / 1000);
    const dias = Math.floor(totalSegundos / 86400);
    const horas = Math.floor((totalSegundos % 86400) / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);

    const partes = [];
    if (dias > 0) partes.push(`${dias} dia${dias > 1 ? 's' : ''}`);
    if (horas > 0) partes.push(`${horas} hora${horas > 1 ? 's' : ''}`);
    if (minutos > 0) partes.push(`${minutos} minuto${minutos > 1 ? 's' : ''}`);

    return partes.length > 0 ? partes.join(' e ') : 'Menos de 1 minuto';
}

/**
 * Verifica se um membro está silenciado no grupo.
 * Se o tempo tiver expirado, remove automaticamente do banco de dados.
 */
function isMuted(groupJid, userJid) {
    if (!groupJid || !userJid) return { muted: false };
    _initTable();

    try {
        const db = getDatabase();
        const row = db.prepare(`
            SELECT * FROM muted_members WHERE group_jid = ? AND user_jid = ?
        `).get(groupJid, userJid);

        if (!row) return { muted: false };

        const now = Date.now();
        const expiresAt = Number(row.expires_at || 0);

        // Se tiver expiração e já passou, remove e libera o membro
        if (expiresAt > 0 && now >= expiresAt) {
            unmuteUser(groupJid, userJid);
            logger.info(`[MUTE EXPIRED] Silenciamento de ${userJid} expirou no grupo ${groupJid}.`);
            return { muted: false };
        }

        const remainingMs = expiresAt > 0 ? Math.max(0, expiresAt - now) : Infinity;
        const remainingText = expiresAt > 0 ? formatMuteRemaining(remainingMs) : 'Tempo Indeterminado';

        return {
            muted: true,
            reason: row.reason || 'Conduta inadequada',
            mutedBy: row.muted_by,
            expiresAt,
            remainingMs,
            remainingText
        };
    } catch (err) {
        logger.error('[MUTE CHECK ERROR]', err.message);
        return { muted: false };
    }
}

/**
 * Silencia um membro no grupo
 */
function muteUser({ groupJid, userJid, mutedBy, durationMinutes = 15, reason = 'Conduta inadequada' }) {
    if (!groupJid || !userJid) throw new Error('Parâmetros groupJid e userJid são obrigatórios.');
    _initTable();

    const now = Date.now();
    let durationMs = 0;
    if (typeof durationMinutes === 'string') {
        durationMs = parseMuteDuration(durationMinutes);
    } else if (typeof durationMinutes === 'number') {
        durationMs = durationMinutes > 0 ? durationMinutes * 60 * 1000 : 0;
    }

    const expiresAt = durationMs > 0 ? (now + durationMs) : 0;

    const db = getDatabase();
    db.prepare(`
        INSERT OR REPLACE INTO muted_members (group_jid, user_jid, muted_by, reason, duration_ms, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(groupJid, userJid, mutedBy || 'Administrador', reason || 'Conduta inadequada', durationMs, expiresAt, now);

    logger.info(`[MUTE APPLIED] ${userJid} silenciado em ${groupJid} por ${mutedBy}. Duração: ${durationMs > 0 ? (durationMs / 60000) + 'm' : 'Indefinido'}. Motivo: ${reason}`);

    return {
        ok: true,
        expiresAt,
        durationMs,
        durationText: durationMs > 0 ? formatMuteRemaining(durationMs) : 'Tempo Indeterminado',
        reason
    };
}

/**
 * Remove o silenciamento de um membro no grupo
 */
function unmuteUser(groupJid, userJid) {
    if (!groupJid || !userJid) return false;
    _initTable();

    try {
        const db = getDatabase();
        const res = db.prepare(`
            DELETE FROM muted_members WHERE group_jid = ? AND user_jid = ?
        `).run(groupJid, userJid);
        return res.changes > 0;
    } catch (err) {
        logger.error('[UNMUTE ERROR]', err.message);
        return false;
    }
}

/**
 * Remove todos os silenciamentos do grupo
 */
function resetAllMutes(groupJid) {
    if (!groupJid) return 0;
    _initTable();

    try {
        const db = getDatabase();
        const res = db.prepare(`
            DELETE FROM muted_members WHERE group_jid = ?
        `).run(groupJid);
        return res.changes;
    } catch (err) {
        logger.error('[RESET ALL MUTES ERROR]', err.message);
        return 0;
    }
}

/**
 * Lista todos os membros atualmente silenciados no grupo
 */
function getMutedMembers(groupJid) {
    if (!groupJid) return [];
    _initTable();

    try {
        const db = getDatabase();
        const rows = db.prepare(`
            SELECT * FROM muted_members WHERE group_jid = ? ORDER BY created_at DESC
        `).all(groupJid);

        const now = Date.now();
        const active = [];

        for (const row of rows) {
            const exp = Number(row.expires_at || 0);
            if (exp > 0 && now >= exp) {
                unmuteUser(groupJid, row.user_jid);
                continue;
            }
            active.push({
                userJid: row.user_jid,
                mutedBy: row.muted_by,
                reason: row.reason,
                expiresAt: exp,
                remainingMs: exp > 0 ? Math.max(0, exp - now) : Infinity,
                remainingText: exp > 0 ? formatMuteRemaining(exp - now) : 'Indeterminado'
            });
        }
        return active;
    } catch (err) {
        logger.error('[GET MUTED MEMBERS ERROR]', err.message);
        return [];
    }
}

/**
 * Checa se deve avisar o usuário sobre o mute (com throttling anti-flood)
 */
function shouldNotifyMuted(groupJid, userJid) {
    const key = `${groupJid}_${userJid}`;
    const now = Date.now();
    const last = _muteNotifyThrottle.get(key) || 0;
    if (now - last > THROTTLE_MS) {
        _muteNotifyThrottle.set(key, now);
        return true;
    }
    return false;
}

module.exports = {
    isMuted,
    muteUser,
    unmuteUser,
    resetAllMutes,
    getMutedMembers,
    parseMuteDuration,
    formatMuteRemaining,
    shouldNotifyMuted
};

