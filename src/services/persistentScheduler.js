/**
 * Persistent Scheduler Service
 *
 * Gerencia lembretes, temporizadores e agendamentos com persistência em SQLite.
 * Sobrevive a reinicializações, crashes, deploys e restarts da VPS sem perder dados.
 */

const timerRepo = require('../database/repositories/timerRepository');
const logger = require('../core/logger');
const env = require('../config/env');

const activeTimeouts = new Map(); // id -> timeoutHandle
let globalClient = null;

const TIMEZONE = env.botTimezone || 'America/Sao_Paulo';

function formatLocalTime(timestamp) {
    try {
        return new Date(timestamp).toLocaleString('pt-BR', { timeZone: TIMEZONE });
    } catch (_) {
        return new Date(timestamp).toISOString();
    }
}

/**
 * Dispara um timer pendente
 */
async function triggerTimer(timer, isCatchup = false) {
    if (!timer || timer.status !== 'PENDING') return;

    // Atualiza status imediatamente no banco de dados para evitar reentrância
    timerRepo.updateTimerStatus(timer.id, 'EXECUTED');
    activeTimeouts.delete(timer.id);

    const client = globalClient;
    if (!client) {
        logger.warn(`[SCHEDULER] Timer ${timer.id} venceu mas socket client ainda não está pronto.`);
        return;
    }

    try {
        const { scopeJid, senderJid, type, content, triggerAt, metadata } = timer;
        const senderNumber = senderJid ? senderJid.split('@')[0] : '';
        const mentions = senderJid ? [senderJid] : [];

        let messageText = '';

        if (type === 'group_close') {
            try {
                const groupControlService = require('./groupControlService');
                await groupControlService.closeGroup(client, scopeJid, { silent: true });
                const configRepo = require('../database/repositories/configRepository');
                const cfg = configRepo.getConfig(scopeJid) || {};

                if (Boolean(cfg.fechamento || cfg.fechamentoEnabled)) {
                    const { getGreetingVars, buildCloseMessage, resolveMentionsForText } = require('./groupGreetingService');
                    const vars = await getGreetingVars(client, scopeJid, senderJid, {
                        tempo: (metadata && metadata.durationStr) || "Horário programado",
                        adminJid: senderJid
                    });
                    const messageText = buildCloseMessage(cfg, vars);
                    const mentionsList = resolveMentionsForText(messageText, vars);
                    await client.sendMessage(scopeJid, { text: messageText, mentions: mentionsList });
                }
                logger.info(`[SCHEDULER] Grupo ${scopeJid} fechado automaticamente`);
            } catch (closeErr) {
                logger.error(`[SCHEDULER ERROR] Falha ao fechar grupo ${scopeJid}:`, closeErr);
            }
            return;
        } else if (type === 'group_reopen' || type === 'group_open') {
            try {
                const groupControlService = require('./groupControlService');
                await groupControlService.openGroup(client, scopeJid, { silent: true });
                const configRepo = require('../database/repositories/configRepository');
                const cfg = configRepo.getConfig(scopeJid) || {};

                if (Boolean(cfg.abertura || cfg.aberturaEnabled)) {
                    const { getGreetingVars, buildOpenMessage, resolveMentionsForText } = require('./groupGreetingService');
                    const vars = await getGreetingVars(client, scopeJid, senderJid, {
                        tempo: (metadata && metadata.durationStr) || "Horário programado",
                        adminJid: senderJid
                    });
                    const messageText = buildOpenMessage(cfg, vars);
                    const mentionsList = resolveMentionsForText(messageText, vars);
                    await client.sendMessage(scopeJid, { text: messageText, mentions: mentionsList });
                }
                logger.info(`[SCHEDULER] Grupo ${scopeJid} reaberto automaticamente`);
            } catch (openErr) {
                logger.error(`[SCHEDULER ERROR] Falha ao reabrir grupo ${scopeJid}:`, openErr);
            }
            return;
        } else if (type === 'timer' || type === 'temporizador') {
            const label = metadata?.label || 'tempo esgotado';
            messageText = `🔔 *BEEP BEEP! TEMPO ESGOTADO!* 🔔\n\n` +
                `👤 @${senderNumber}\n` +
                `⏰ *Temporizador:* _${label}_\n` +
                `🎯 *Motivo:* _${content || 'Finalizado'}_` +
                (isCatchup ? `\n\n⚠️ _(Aviso entregue com pequeno atraso devido a reinicialização do sistema)_` : '');
        } else {
            // reminder / lembrete
            messageText = `⏰ *LEMBRETE ATIVADO!* ⏰\n\n` +
                `👤 @${senderNumber}\n` +
                `📝 *Recado:* _${content}_\n` +
                `📅 *Programado para:* ${formatLocalTime(triggerAt)}` +
                (isCatchup ? `\n\n⚠️ _(Aviso entregue com pequeno atraso devido a reinicialização do sistema)_` : '');
        }

        await client.sendMessage(scopeJid, {
            text: messageText,
            mentions
        });

        logger.info(`[SCHEDULER] Timer ${timer.id} disparado com sucesso para ${scopeJid}`);
    } catch (err) {
        logger.error(`[SCHEDULER ERROR] Falha ao enviar notificação do timer ${timer.id}:`, err);
    }
}

/**
 * Engata um timer no loop de eventos do Node.js
 */
function armTimer(timer) {
    if (!timer || timer.status !== 'PENDING') return;
    if (activeTimeouts.has(timer.id)) {
        clearTimeout(activeTimeouts.get(timer.id));
        activeTimeouts.delete(timer.id);
    }

    const now = Date.now();
    const remaining = timer.triggerAt - now;

    if (remaining <= 0) {
        // Já expirou: dispara no próximo tick
        setImmediate(() => triggerTimer(timer, true));
        return;
    }

    // Node.js setTimeout suporta no máximo 2^31 - 1 (~24.8 dias)
    const MAX_TIMEOUT_MS = 2147483647;
    const delay = Math.min(remaining, MAX_TIMEOUT_MS);

    const handle = setTimeout(() => {
        const currentRemaining = timer.triggerAt - Date.now();
        if (currentRemaining <= 1000) {
            triggerTimer(timer, false);
        } else {
            armTimer(timer); // Re-arma para o restante
        }
    }, delay);

    activeTimeouts.set(timer.id, handle);
}

/**
 * Inicializa o agendador no boot
 */
function init(client) {
    globalClient = client;
    logger.info('🔄 [SCHEDULER] Inicializando motor de agendamentos persistentes...');

    try {
        const pending = timerRepo.getPendingTimers();
        let catchupCount = 0;
        let futureCount = 0;
        const now = Date.now();

        for (const timer of pending) {
            if (timer.triggerAt <= now) {
                catchupCount++;
                armTimer(timer);
            } else {
                futureCount++;
                armTimer(timer);
            }
        }

        logger.info(`✅ [SCHEDULER] Recuperados ${pending.length} timers no SQLite (${futureCount} ativos, ${catchupCount} vencidos recuperados)`);
    } catch (err) {
        logger.error('[SCHEDULER ERROR] Falha ao carregar timers persistentes no boot:', err);
    }
}

/**
 * Cria e persiste um novo lembrete
 */
function scheduleReminder({ scopeJid, senderJid, message, delayMs, label = '' }) {
    const triggerAt = Date.now() + delayMs;
    const timerId = timerRepo.createTimer({
        scopeJid,
        senderJid,
        type: 'reminder',
        content: message,
        triggerAt,
        metadata: { label }
    });

    const timer = timerRepo.getTimerById(timerId);
    if (timer) armTimer(timer);

    return { timerId, triggerAt };
}

/**
 * Cria e persiste um novo temporizador/timer regressivo
 */
function scheduleTimer({ scopeJid, senderJid, message = 'Tempo esgotado!', delayMs, label = '' }) {
    const triggerAt = Date.now() + delayMs;
    const timerId = timerRepo.createTimer({
        scopeJid,
        senderJid,
        type: 'timer',
        content: message,
        triggerAt,
        metadata: { label }
    });

    const timer = timerRepo.getTimerById(timerId);
    if (timer) armTimer(timer);

    return { timerId, triggerAt };
}

/**
 * Cancela um timer pendente
 */
function cancel(timerId, senderJid = null) {
    if (activeTimeouts.has(timerId)) {
        clearTimeout(activeTimeouts.get(timerId));
        activeTimeouts.delete(timerId);
    }
    return timerRepo.cancelTimer(timerId, senderJid);
}

/**
 * Lista timers ativos do usuário
 */
function listUserTimers(senderJid, scopeJid = null) {
    return timerRepo.getActiveTimersForUser(senderJid, scopeJid);
}

/**
 * Agenda o fechamento automático de um grupo no tempo à frente (ex: 2m, 2h, 22:00)
 */
function scheduleGroupClose({ scopeJid, triggerAt, durationStr = '' }) {
    cancelGroupClose(scopeJid);

    const timerId = `group_close_${scopeJid}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    timerRepo.createTimer({
        id: timerId,
        scopeJid,
        senderJid: null,
        type: 'group_close',
        content: 'Fechamento automático do grupo',
        triggerAt,
        metadata: { durationStr }
    });

    const timer = timerRepo.getTimerById(timerId);
    if (timer) armTimer(timer);

    return { timerId, triggerAt };
}

/**
 * Cancela o fechamento automático agendado de um grupo
 */
function cancelGroupClose(scopeJid) {
    for (const [id, handle] of activeTimeouts.entries()) {
        if (id.startsWith(`group_close_${scopeJid}`)) {
            clearTimeout(handle);
            activeTimeouts.delete(id);
        }
    }
    return timerRepo.cancelTimersByScopeAndType(scopeJid, 'group_close');
}

/**
 * Agenda a abertura automática de um grupo no tempo à frente (ex: 2m, 2h, 08:00)
 */
function scheduleGroupOpen({ scopeJid, triggerAt, durationStr = '' }) {
    cancelGroupOpen(scopeJid);

    const timerId = `group_open_${scopeJid}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    timerRepo.createTimer({
        id: timerId,
        scopeJid,
        senderJid: null,
        type: 'group_open',
        content: 'Abertura automática do grupo',
        triggerAt,
        metadata: { durationStr }
    });

    const timer = timerRepo.getTimerById(timerId);
    if (timer) armTimer(timer);

    return { timerId, triggerAt };
}

/**
 * Cancela a abertura/reabertura automática de um grupo
 */
function cancelGroupOpen(scopeJid) {
    for (const [id, handle] of activeTimeouts.entries()) {
        if (id.startsWith(`group_open_${scopeJid}`) || id.startsWith(`group_reopen_${scopeJid}`)) {
            clearTimeout(handle);
            activeTimeouts.delete(id);
        }
    }
    timerRepo.cancelTimersByScopeAndType(scopeJid, 'group_open');
    return timerRepo.cancelTimersByScopeAndType(scopeJid, 'group_reopen');
}

/**
 * Agenda a reabertura automática de um grupo
 */
function scheduleGroupReopen({ scopeJid, triggerAt, durationStr = '' }) {
    return scheduleGroupOpen({ scopeJid, triggerAt, durationStr });
}

/**
 * Cancela a reabertura automática de um grupo
 */
function cancelGroupReopen(scopeJid) {
    return cancelGroupOpen(scopeJid);
}

/**
 * Registra um timer dinâmico em memória e o arma
 */
function registerDynamicTimer(timer) {
    if (timer) armTimer(timer);
}

/**
 * Cancela timers por escopo e tipo
 */
function cancelTimerByScopeAndType(scopeJid, type) {
    for (const [id, handle] of activeTimeouts.entries()) {
        if (id.includes(scopeJid) && id.includes(type)) {
            clearTimeout(handle);
            activeTimeouts.delete(id);
        }
    }
    return timerRepo.cancelTimersByScopeAndType(scopeJid, type);
}

module.exports = {
    init,
    scheduleReminder,
    scheduleTimer,
    scheduleGroupClose,
    cancelGroupClose,
    scheduleGroupOpen,
    cancelGroupOpen,
    scheduleGroupReopen,
    cancelGroupReopen,
    registerDynamicTimer,
    cancelTimerByScopeAndType,
    cancel,
    listUserTimers,
    formatLocalTime,
    triggerTimer
};
