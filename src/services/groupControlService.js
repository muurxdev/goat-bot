/**
 * Group Control Service (Persistência em SQLite WAL via PersistentScheduler)
 *
 * Fecha e reabre grupos do WhatsApp (só admins podem falar) com suporte a:
 *  - Duração: 30m, 2h, 1d (reabre após o tempo decorrido)
 *  - Horário fixo: 20:44, 22:00, 08:30 (reabre no horário programado de Brasília)
 *  - Indefinido: até um administrador usar .abrirgrupo
 *
 * O agendamento de reabertura é 100% persistente no SQLite:
 * sobrevive a reinício da VPS, PM2 e reconexões do Baileys.
 */

const logger = require('../core/logger');
const { parseDuration, parseTimeToTimestamp } = require('./botScheduler');
const persistentScheduler = require('./persistentScheduler');

const groupStates = new Map();

const GROUP_SETTINGS = Object.freeze({
    CLOSED: 'announcement',
    OPEN: 'not_announcement'
});

/**
 * Converte string flexível de duração ou horário em timestamp futuro.
 * Suporta:
 *  - Minutos diretos: '10 minutos', '10min', '10m', '10' (assume minutos)
 *  - Horas: '2 horas', '2h', '1 hora e 30 minutos', '1h30m'
 *  - Segundos e dias: '45 segundos', '30s', '1 dia', '2d'
 *  - Prefixos naturais: 'daqui a 15 minutos', 'em 10 min', 'por 2 horas'
 *  - Horários de Brasília: '20:44', '22:00', '22h', '22h30'
 * @param {string} input
 * @param {number} baseTs
 * @returns {number|null}
 */
function parseDurationOrTime(input, baseTs = Date.now()) {
    if (!input || typeof input !== 'string') return null;
    let s = input.toLowerCase().trim()
        .replace(/^(daqui\s+a|em|por|durante)\s+/i, '')
        .replace(/\s+/g, ' ');

    if (!s) return null;

    // 1. Horário Fixo (HH:MM ou HHh ou HHhMM)
    const horaMatch = s.match(/^(\d{1,2})(?::(\d{2})|h(\d{2})?)$/);
    if (horaMatch) {
        const h = parseInt(horaMatch[1], 10);
        const m = parseInt(horaMatch[2] || horaMatch[3] || '0', 10);
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
            const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            return parseTimeToTimestamp(timeStr, baseTs);
        }
    }

    // 2. Se for número puro (ex: '10', '30', '5'), interpreta diretamente como MINUTOS
    if (/^\d+$/.test(s)) {
        const mins = parseInt(s, 10);
        if (mins > 0 && mins <= 525600) { // até 1 ano em minutos
            return baseTs + (mins * 60 * 1000);
        }
    }

    // 3. Parser de Duração Composta (dias, horas, minutos, segundos)
    let totalMs = 0;
    let matchedAny = false;

    // Dias
    const dMatch = s.match(/(\d+)\s*(?:d|dias?)\b/i);
    if (dMatch) { totalMs += parseInt(dMatch[1], 10) * 24 * 60 * 60 * 1000; matchedAny = true; }

    // Horas
    const hMatch = s.match(/(\d+)\s*(?:h|horas?)\b/i);
    if (hMatch) { totalMs += parseInt(hMatch[1], 10) * 60 * 60 * 1000; matchedAny = true; }

    // Minutos
    const mMatch = s.match(/(\d+)\s*(?:m|min|mins|minutos?)\b/i);
    if (mMatch) { totalMs += parseInt(mMatch[1], 10) * 60 * 1000; matchedAny = true; }

    // Segundos
    const sMatch = s.match(/(\d+)\s*(?:s|seg|segs|segundos?)\b/i);
    if (sMatch) { totalMs += parseInt(sMatch[1], 10) * 1000; matchedAny = true; }

    if (matchedAny && totalMs > 0) {
        return baseTs + totalMs;
    }

    // Fallback legado parseDuration (ex: 30s, 10m, 2h)
    try {
        return baseTs + parseDuration(s);
    } catch (_) {
        return null;
    }
}

/**
 * Fecha o grupo imediatamente no WhatsApp
 * @param {object} client - Socket Baileys
 * @param {string} groupJid - JID do grupo
 * @param {object} [opts]
 * @param {boolean} [opts.silent]
 * @returns {Promise<{ closed: boolean, until: null }>}
 */
async function closeGroup(client, groupJid, { silent = false } = {}) {
    if (!client || typeof client.groupSettingUpdate !== 'function') {
        throw new Error('Cliente Baileys não vinculado ao Group Control Service');
    }
    if (!groupJid) throw new Error('groupJid é obrigatório');

    // Cancela qualquer agendamento de fechamento futuro pendente
    persistentScheduler.cancelGroupClose(groupJid);

    // Altera a configuração do grupo no WhatsApp
    await client.groupSettingUpdate(groupJid, GROUP_SETTINGS.CLOSED);

    clearGroupState(groupJid);

    const entry = { closed: true, until: null, timer: null };
    groupStates.set(groupJid, entry);

    if (!silent) logger.info(`[GROUP CONTROL] Grupo ${groupJid} fechado imediatamente`);
    return entry;
}

/**
 * Agenda o fechamento do grupo para um tempo à frente (ex: 2m, 2h, 22:00)
 * @param {string} groupJid - JID do grupo
 * @param {string} rawInput - ex: '2m', '2h', '30s', '22:00'
 * @returns {{ scheduled: boolean, triggerAt: number, durationStr: string }}
 */
function scheduleCloseGroup(groupJid, rawInput) {
    if (!groupJid) throw new Error('groupJid é obrigatório');
    if (!rawInput || typeof rawInput !== 'string') {
        throw new Error('Informe uma duração (ex: 2m, 2h, 30s) ou horário (ex: 22:00).');
    }

    const triggerAt = parseDurationOrTime(rawInput);
    if (!triggerAt || isNaN(triggerAt)) {
        throw new Error(`Tempo ou horário inválido: "${rawInput}". Use durações como 2m, 2h, 30s ou horários como 22:00.`);
    }

    persistentScheduler.scheduleGroupClose({
        scopeJid: groupJid,
        triggerAt,
        durationStr: rawInput
    });

    logger.info(`[GROUP CONTROL] Fechamento do grupo ${groupJid} agendado para ${new Date(triggerAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (param=${rawInput})`);
    return { scheduled: true, triggerAt, durationStr: rawInput };
}

/**
 * Reabre o grupo imediatamente (todos podem falar) e cancela qualquer agendamento pendente
 * @param {object} client - Socket Baileys
 * @param {string} groupJid
 * @param {object} [opts]
 * @param {boolean} [opts.silent]
 * @returns {Promise<{ closed: boolean, until: null }>}
 */
async function openGroup(client, groupJid, { silent = false } = {}) {
    if (!client || typeof client.groupSettingUpdate !== 'function') {
        throw new Error('Cliente Baileys não vinculado ao Group Control Service');
    }
    if (!groupJid) throw new Error('groupJid é obrigatório');

    // Remove qualquer agendamento persistente em SQLite e memória
    persistentScheduler.cancelGroupClose(groupJid);
    persistentScheduler.cancelGroupOpen(groupJid);

    await client.groupSettingUpdate(groupJid, GROUP_SETTINGS.OPEN);

    const entry = { closed: false, until: null, timer: null };
    groupStates.set(groupJid, entry);

    if (!silent) logger.info(`[GROUP CONTROL] Grupo ${groupJid} reaberto imediatamente`);
    return entry;
}

/**
 * Agenda a abertura do grupo para um tempo à frente (ex: 2m, 2h, 08:00)
 * @param {string} groupJid - JID do grupo
 * @param {string} rawInput - ex: '2m', '2h', '30s', '08:00'
 * @returns {{ scheduled: boolean, triggerAt: number, durationStr: string }}
 */
function scheduleOpenGroup(groupJid, rawInput) {
    if (!groupJid) throw new Error('groupJid é obrigatório');
    if (!rawInput || typeof rawInput !== 'string') {
        throw new Error('Informe uma duração (ex: 2m, 2h, 30s) ou horário (ex: 08:00).');
    }

    const triggerAt = parseDurationOrTime(rawInput);
    if (!triggerAt || isNaN(triggerAt)) {
        throw new Error(`Tempo ou horário inválido: "${rawInput}". Use durações como 2m, 2h, 30s ou horários como 08:00.`);
    }

    persistentScheduler.scheduleGroupOpen({
        scopeJid: groupJid,
        triggerAt,
        durationStr: rawInput
    });

    logger.info(`[GROUP CONTROL] Abertura do grupo ${groupJid} agendada para ${new Date(triggerAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (param=${rawInput})`);
    return { scheduled: true, triggerAt, durationStr: rawInput };
}

/**
 * Consulta o estado atual em memória do grupo
 * @param {string} groupJid
 * @returns {{ closed: boolean, until: number|null }}
 */
function getGroupStatus(groupJid) {
    return groupStates.get(groupJid) || { closed: false, until: null };
}

/**
 * Limpa o estado e cancela timers do grupo
 * @param {string} groupJid
 */
function clearGroupState(groupJid) {
    const prev = groupStates.get(groupJid);
    if (prev && prev.timer) clearTimeout(prev.timer);
    groupStates.delete(groupJid);
    persistentScheduler.cancelGroupClose(groupJid);
    persistentScheduler.cancelGroupOpen(groupJid);
}

module.exports = {
    GROUP_SETTINGS,
    parseDurationOrTime,
    closeGroup,
    scheduleCloseGroup,
    openGroup,
    scheduleOpenGroup,
    getGroupStatus,
    clearGroupState
};
