/**
 * Group Auto Schedule Service
 *
 * Gerencia a agenda semanal de abertura e fechamento automático de grupos do WhatsApp.
 * - Suporta configuração de dias (ex: seg-sex, todos, sab-dom, seg/qua/sex).
 * - Horários de fechamento e reabertura no fuso de Brasília (America/Sao_Paulo).
 * - Notificações automáticas no grupo com modelo padrão ou mensagem 100% personalizada.
 * - Persistência completa no SQLite (sobrevive a restarts da VPS e reconexões).
 */

const dataService = require('./dataService');
const groupControlService = require('./groupControlService');
const groupAuthService = require('./groupAuthService');
const { getGreetingVars, resolveMentionsForText } = require('./groupGreetingService');
const logger = require('../core/logger');

const TIMEZONE = 'America/Sao_Paulo';
const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const DAY_ABBR = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

let scheduleInterval = null;

/**
 * Mensagem padrão de fechamento automático
 */
const DEFAULT_CLOSE_MESSAGE = `╔══════════════════════════════╗
║  🔒 *GRUPO FECHADO (AGENDA)*  ║
╚══════════════════════════════╝

O grupo *{grupo}* foi fechado pela agenda programada.
Por enquanto, apenas administradores podem enviar mensagens.

⏱️ *Reabertura programada:* {hora_abrir}
📅 *Próxima abertura:* {dia_abrir}`;

/**
 * Mensagem padrão de reabertura automática
 */
const DEFAULT_OPEN_MESSAGE = `╔══════════════════════════════╗
║  🔓 *GRUPO REABERTO (AGENDA)* ║
╚══════════════════════════════╝

Bom dia! O grupo *{grupo}* está reaberto para todos os membros.
Respeitem as regras e tenham ótimas conversas! 💬`;

/**
 * Converte texto de dias da semana em array de números (0=Dom, 1=Seg, ..., 6=Sab)
 * Exemplos aceitos:
 *  - 'seg-sex', 'segunda-sexta' -> [1, 2, 3, 4, 5]
 *  - 'todos', 'diario', 'dia' -> [0, 1, 2, 3, 4, 5, 6]
 *  - 'fds', 'fimdesemana', 'sab-dom' -> [0, 6]
 *  - 'seg,qua,sex' -> [1, 3, 5]
 * @param {string} input
 * @returns {number[]}
 */
function parseDays(input) {
    if (!input || typeof input !== 'string') return [1, 2, 3, 4, 5]; // padrão: seg-sex
    const clean = input.toLowerCase().replace(/\s+/g, '');

    if (['todos', 'diario', 'dia', 'diariamente', 'tododia', 'tododia'].includes(clean)) {
        return [0, 1, 2, 3, 4, 5, 6];
    }
    if (['fds', 'fimdesemana', 'finsdesemana', 'sab-dom', 'sab,dom', 'dom,sab'].includes(clean)) {
        return [0, 6];
    }
    if (['seg-sex', 'segunda-sexta', 'util', 'diasuteis', 'uteis'].includes(clean)) {
        return [1, 2, 3, 4, 5];
    }
    if (['seg-sab', 'segunda-sabado'].includes(clean)) {
        return [1, 2, 3, 4, 5, 6];
    }

    // Intervalo com hífen (ex: ter-qui)
    if (clean.includes('-')) {
        const [inicioStr, fimStr] = clean.split('-');
        const idxInicio = DAY_ABBR.findIndex(d => inicioStr.startsWith(d));
        const idxFim = DAY_ABBR.findIndex(d => fimStr.startsWith(d));
        if (idxInicio !== -1 && idxFim !== -1) {
            const dias = [];
            let cur = idxInicio;
            while (true) {
                dias.push(cur);
                if (cur === idxFim) break;
                cur = (cur + 1) % 7;
            }
            return dias;
        }
    }

    // Lista separada por vírgula (ex: seg,qua,sex)
    const partes = clean.split(/[,/]/);
    const dias = new Set();
    for (const p of partes) {
        const idx = DAY_ABBR.findIndex(d => p.startsWith(d));
        if (idx !== -1) dias.add(idx);
    }

    return dias.size > 0 ? Array.from(dias).sort((a, b) => a - b) : [1, 2, 3, 4, 5];
}

/**
 * Formata lista de dias em texto amigável
 * @param {number[]} days
 * @returns {string}
 */
function formatDays(days) {
    if (!Array.isArray(days) || days.length === 0) return 'Nenhum dia configurado';
    const sorted = Array.from(new Set(days)).sort((a, b) => a - b);
    if (sorted.length === 7) return 'Todos os dias (Segunda a Domingo)';
    if (sorted.length === 5 && sorted.every((d, i) => d === i + 1)) return 'Segunda a Sexta-feira';
    if (sorted.length === 2 && sorted.includes(0) && sorted.includes(6)) return 'Fins de semana (Sábado e Domingo)';
    return sorted.map(d => DAY_NAMES[d]).join(', ');
}

/**
 * Consulta a agenda configurada do grupo
 * @param {string} groupJid
 * @returns {object}
 */
function calculateCycleExpiration(cycle, baseDate = Date.now()) {
    if (!cycle || cycle === 'permanente' || cycle === 'infinito' || cycle === 'sempre') {
        return null;
    }
    const clean = String(cycle).toLowerCase().trim();
    if (clean === 'semana' || clean === '7dias' || clean === '1semana') {
        return baseDate + 7 * 24 * 60 * 60 * 1000;
    }
    if (clean === 'mes' || clean === 'mês' || clean === '30dias' || clean === '1mes') {
        return baseDate + 30 * 24 * 60 * 60 * 1000;
    }
    if (clean.startsWith('ate') || clean.startsWith('até')) {
        const dateStr = clean.replace(/^(ate|até)\s*/i, '').trim();
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const y = parseInt(parts[2], 10);
            const targetDate = new Date(y, m, d, 23, 59, 59);
            if (!isNaN(targetDate.getTime())) {
                return targetDate.getTime();
            }
        }
    }
    return null;
}

function formatCycle(sched) {
    if (!sched || !sched.cycle || sched.cycle === 'permanente') {
        return '♾️ Permanente (ativo até remover)';
    }
    const cycle = String(sched.cycle).toLowerCase();
    if (cycle === 'semana') {
        const restanteDias = sched.expiresAt ? Math.max(0, Math.ceil((sched.expiresAt - Date.now()) / (24 * 60 * 60 * 1000))) : 7;
        return `📅 Semanal (${restanteDias} dia(s) restante(s))`;
    }
    if (cycle === 'mes' || cycle === 'mês') {
        const restanteDias = sched.expiresAt ? Math.max(0, Math.ceil((sched.expiresAt - Date.now()) / (24 * 60 * 60 * 1000))) : 30;
        return `🗓️ Mensal (${restanteDias} dia(s) restante(s))`;
    }
    if (sched.expiresAt) {
        const expStr = new Date(sched.expiresAt).toLocaleDateString('pt-BR', { timeZone: TIMEZONE });
        return `⏳ Até ${expStr}`;
    }
    return '♾️ Permanente (ativo até remover)';
}

function getSchedule(groupJid) {
    const configs = dataService.getConfigsData();
    const groupCfg = configs[groupJid] || {};
    const sched = groupCfg.autoSchedule || {};
    return {
        enabled: Boolean(sched.enabled),
        days: Array.isArray(sched.days) && sched.days.length > 0 ? sched.days : [1, 2, 3, 4, 5],
        closeTime: sched.closeTime || '22:00',
        openTime: sched.openTime || '07:00',
        closeMsg: sched.closeMsg || null,
        openMsg: sched.openMsg || null,
        lastAction: sched.lastAction || null,
        cycle: sched.cycle || 'permanente',
        startedAt: sched.startedAt || null,
        expiresAt: sched.expiresAt || null,
        expired: Boolean(sched.expired)
    };
}

/**
 * Salva a agenda do grupo
 * @param {string} groupJid
 * @param {object} newSched
 */
async function saveSchedule(groupJid, newSched) {
    const configs = dataService.getConfigsData();
    if (!configs[groupJid]) configs[groupJid] = {};
    const cur = configs[groupJid].autoSchedule || {};
    configs[groupJid].autoSchedule = { ...cur, ...newSched };
    await dataService.saveConfigsData(configs);
    return configs[groupJid].autoSchedule;
}

/**
 * Substitui variáveis dinâmicas em mensagens de agenda
 */
function formatScheduleMessage(tpl, vars = {}) {
    const {
        groupName = 'Grupo',
        horaFechar = '22:00',
        horaAbrir = '07:00',
        diaAbrir = '',
        userTag = '@membro',
        donoTag = '@dono',
        admsTags = '@admins'
    } = vars;

    return String(tpl)
        .replace(/\{grupo\}/gi, groupName)
        .replace(/\{nome\}/gi, groupName)
        .replace(/\{hora_fechar\}/gi, horaFechar)
        .replace(/\{hora_abrir\}/gi, horaAbrir)
        .replace(/\{dia_abrir\}/gi, diaAbrir || 'Hoje/Amanhã')
        .replace(/\{user\}/gi, userTag)
        .replace(/\{dono\}/gi, donoTag)
        .replace(/\{criador\}/gi, donoTag)
        .replace(/\{adms\}/gi, admsTags);
}

/**
 * Avalia e executa fechamento ou reabertura automática para todos os grupos
 * @param {object} client - Socket Baileys
 */
async function checkSchedules(client) {
    if (!client || typeof client.groupSettingUpdate !== 'function') return;

    const now = new Date();
    const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const currentTime = formatter.format(now); // "HH:MM"
    const todayStr = now.toLocaleDateString('pt-BR', { timeZone: TIMEZONE }); // "DD/MM/AAAA"

    // Dia da semana de 0 (domingo) a 6 (sábado) no fuso de Brasília
    const dayFormatter = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, weekday: 'narrow' });
    const dayOfWeek = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE })).getDay();

    const configs = dataService.getConfigsData();

    for (const [groupJid, cfg] of Object.entries(configs)) {
        if (!groupJid.endsWith('@g.us')) continue;
        const sched = cfg?.autoSchedule;
        if (!sched || !sched.enabled) continue;

        // 0. VERIFICAÇÃO DE EXPIRAÇÃO DO CICLO (Semana, Mês ou Data Limite)
        if (sched.expiresAt && Date.now() > sched.expiresAt) {
            sched.enabled = false;
            sched.expired = true;
            configs[groupJid].autoSchedule = sched;
            await dataService.saveConfigsData(configs);
            logger.info(`[GROUP SCHEDULE] Agenda expirou para o grupo ${groupJid} (ciclo: ${sched.cycle})`);
            try {
                await groupControlService.openGroup(client, groupJid);
                const cicloFmt = sched.cycle === 'semana' ? 'Semanal (7 dias)' : sched.cycle === 'mes' ? 'Mensal (30 dias)' : 'Programado';
                await client.sendMessage(groupJid, {
                    text: `📅 *[AGENDA PROGRAMADA CONCLUÍDA]*\n\nO ciclo *${cicloFmt}* da agenda automática deste grupo foi finalizado com sucesso.\n🔓 O grupo foi reaberto e a agenda ficará pausada até uma nova programação com \`.agenda\`.`
                });
            } catch (expErr) {
                logger.warn(`[GROUP SCHEDULE] Falha ao finalizar ciclo expirado em ${groupJid}: ${expErr.message}`);
            }
            continue;
        }

        const days = Array.isArray(sched.days) ? sched.days : [1, 2, 3, 4, 5];
        if (!days.includes(dayOfWeek)) continue;

        const closeTime = sched.closeTime || '22:00';
        const openTime = sched.openTime || '07:00';
        const lastAction = sched.lastAction || {};

        // 1. FECHAMENTO AUTOMÁTICO
        if (currentTime === closeTime && (lastAction.action !== 'close' || lastAction.date !== todayStr)) {
            try {
                const groupData = await groupAuthService.getGroupData(groupJid);
                if (!groupData.isBotAdmin) {
                    logger.warn(`[GROUP SCHEDULE] Não sou admin em ${groupJid} para fechar o grupo.`);
                    continue;
                }

                await groupControlService.closeGroup(client, groupJid);
                const gVars = await getGreetingVars(client, groupJid);
                const tpl = sched.closeMsg || DEFAULT_CLOSE_MESSAGE;
                const text = formatScheduleMessage(tpl, {
                    groupName: gVars.groupName,
                    horaFechar: closeTime,
                    horaAbrir: openTime,
                    diaAbrir: 'às ' + openTime,
                    donoTag: gVars.donoTag,
                    admsTags: gVars.admsTags
                });

                const mentions = resolveMentionsForText(text, gVars);
                await client.sendMessage(groupJid, { text, mentions });

                sched.lastAction = { action: 'close', date: todayStr, timestamp: Date.now() };
                configs[groupJid].autoSchedule = sched;
                await dataService.saveConfigsData(configs);
                logger.info(`[GROUP SCHEDULE] Grupo ${groupJid} fechado automaticamente às ${currentTime}`);
            } catch (closeErr) {
                logger.error(`[GROUP SCHEDULE ERROR] Falha ao fechar ${groupJid}:`, closeErr);
            }
        }

        // 2. REABERTURA AUTOMÁTICA
        else if (currentTime === openTime && (lastAction.action !== 'open' || lastAction.date !== todayStr)) {
            try {
                const groupData = await groupAuthService.getGroupData(groupJid);
                if (!groupData.isBotAdmin) {
                    logger.warn(`[GROUP SCHEDULE] Não sou admin em ${groupJid} para reabrir o grupo.`);
                    continue;
                }

                await groupControlService.openGroup(client, groupJid);
                const gVars = await getGreetingVars(client, groupJid);
                const tpl = sched.openMsg || DEFAULT_OPEN_MESSAGE;
                const text = formatScheduleMessage(tpl, {
                    groupName: gVars.groupName,
                    horaFechar: closeTime,
                    horaAbrir: openTime,
                    donoTag: gVars.donoTag,
                    admsTags: gVars.admsTags
                });

                const mentions = resolveMentionsForText(text, gVars);
                await client.sendMessage(groupJid, { text, mentions });

                sched.lastAction = { action: 'open', date: todayStr, timestamp: Date.now() };
                configs[groupJid].autoSchedule = sched;
                await dataService.saveConfigsData(configs);
                logger.info(`[GROUP SCHEDULE] Grupo ${groupJid} reaberto automaticamente às ${currentTime}`);
            } catch (openErr) {
                logger.error(`[GROUP SCHEDULE ERROR] Falha ao reabrir ${groupJid}:`, openErr);
            }
        }
    }
}

/**
 * Inicia o worker ativo de monitoramento de agenda (ciclo: a cada 60s)
 * @param {object} client - Socket Baileys
 */
function init(client) {
    if (scheduleInterval) clearInterval(scheduleInterval);
    scheduleInterval = setInterval(() => {
        checkSchedules(client).catch(err => {
            logger.error('[GROUP SCHEDULE WORKER ERROR]', err);
        });
    }, 60000);
    logger.info('🛡️ [GROUP SCHEDULE WORKER] Monitor de agenda automática de grupos ativo (ciclo: 60s).');
}

/**
 * Encerra o worker
 */
function stop() {
    if (scheduleInterval) {
        clearInterval(scheduleInterval);
        scheduleInterval = null;
    }
}

module.exports = {
    parseDays,
    formatDays,
    calculateCycleExpiration,
    formatCycle,
    getSchedule,
    saveSchedule,
    formatScheduleMessage,
    checkSchedules,
    init,
    stop,
    DEFAULT_CLOSE_MESSAGE,
    DEFAULT_OPEN_MESSAGE
};
