/**
 * Bot Lifecycle Scheduler Service
 *
 * Gerencia agendamentos de abertura, fechamento e estado operacional do bot
 * com persistência total em SQLite e recuperação após restarts (PM2 / Docker / VPS).
 */

const scheduleRepo = require('../database/repositories/scheduleRepository')
const logger = require('../core/logger')
const env = require('../config/env')

const BOT_STATES = {
    ONLINE: 'ONLINE',
    SCHEDULED_CLOSE: 'SCHEDULED_CLOSE',
    CLOSING: 'CLOSING',
    OFFLINE: 'OFFLINE',
    SCHEDULED_OPEN: 'SCHEDULED_OPEN',
    STARTING: 'STARTING',
    MAINTENANCE: 'MAINTENANCE'
}

let activeCloseTimer = null
let activeOpenTimer = null

/**
 * Fuso em que os horários são lidos e mostrados. A VPS roda em UTC: sem isto,
 * ".botclose 23:00" fechava às 20h de Brasília e as telas mostravam a hora do
 * servidor. Fuso inválido no .env cai no padrão com aviso no log.
 */
const timezone = (() => {
    const pedido = env.botTimezone || 'America/Sao_Paulo'
    try {
        new Intl.DateTimeFormat('pt-BR', { timeZone: pedido })
        return pedido
    } catch (err) {
        logger.warn(`[SCHEDULER] BOT_TIMEZONE "${pedido}" não é um fuso válido (${err.message}); usando America/Sao_Paulo`)
        return 'America/Sao_Paulo'
    }
})()

const _partesFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
})

/** Data e hora de um instante como aparecem no relógio do fuso configurado. */
function partesNoFuso(ts) {
    const p = {}
    for (const { type, value } of _partesFmt.formatToParts(new Date(ts))) p[type] = value
    return {
        ano: Number(p.year), mes: Number(p.month), dia: Number(p.day),
        hora: Number(p.hour) % 24, minuto: Number(p.minute), segundo: Number(p.second)
    }
}

/** Quanto o relógio do fuso está à frente do UTC naquele instante, em ms. */
function deslocamentoDoFuso(ts) {
    const p = partesNoFuso(ts)
    return Date.UTC(p.ano, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo) - Math.floor(ts / 1000) * 1000
}

/** Instante (ms) em que o relógio do fuso marca a data e hora dadas. Dia fora do mês é normalizado. */
function instanteNoFuso(ano, mes, dia, hora, minuto) {
    const ingenuo = Date.UTC(ano, mes - 1, dia, hora, minuto, 0, 0)
    let ts = ingenuo - deslocamentoDoFuso(ingenuo)
    const ajuste = deslocamentoDoFuso(ts)
    if (ingenuo - ajuste !== ts) ts = ingenuo - ajuste
    return ts
}

/** "HH:MM" no fuso configurado. */
function formatarHora(ts) {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: timezone })
}

/** Data e hora completas no fuso configurado (para log). */
function formatarDataHora(ts) {
    return new Date(ts).toLocaleString('pt-BR', { timeZone: timezone })
}

/**
 * Converte string de duração (30s, 10m, 2h, 1d) em milissegundos
 */
function parseDuration(durationStr) {
    if (!durationStr || typeof durationStr !== 'string') {
        throw new Error('Duração inválida. Formato esperado: 30s, 10m, 2h, 1d.')
    }

    const match = durationStr.trim().match(/^(\d+)([smhd])$/i)
    if (!match) {
        throw new Error('Unidade de duração inválida. Use s (segundos), m (minutos), h (horas) ou d (dias). Ex: 30m, 2h.')
    }

    const value = parseInt(match[1], 10)
    const unit = match[2].toLowerCase()

    if (value <= 0 || isNaN(value)) {
        throw new Error('O valor da duração deve ser um número inteiro positivo maior que zero.')
    }

    if (unit === 'd' && value > 365) {
        throw new Error('Duração máxima permitida é de 365 dias.')
    }

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    }

    return value * multipliers[unit]
}

/**
 * Converte horário no formato HH:MM (ex: 23:00, 07:30) para timestamp no fuso configurado.
 * Devolve a próxima vez que o relógio marca esse horário depois de baseTs.
 */
function parseTimeToTimestamp(timeStr, baseTs = Date.now()) {
    if (!timeStr || typeof timeStr !== 'string') {
        throw new Error('Horário inválido. Formato esperado: HH:MM (ex: 23:00, 07:30).')
    }

    const match = timeStr.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
    if (!match) {
        throw new Error('Horário inválido. Horas devem estar entre 00 e 23, e minutos entre 00 e 59.')
    }

    const hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)

    const hoje = partesNoFuso(baseTs)
    let alvo = instanteNoFuso(hoje.ano, hoje.mes, hoje.dia, hours, minutes)

    // Se o horário já passou hoje, agenda para o dia seguinte
    if (alvo <= baseTs) {
        alvo = instanteNoFuso(hoje.ano, hoje.mes, hoje.dia + 1, hours, minutes)
    }

    return alvo
}

/**
 * Retorna o estado operacional atual do bot
 */
function getBotState() {
    return scheduleRepo.getOperationalState()
}

/**
 * Define o estado operacional do bot
 */
function setBotState(state) {
    scheduleRepo.setOperationalState(state)
}

/**
 * Inicializa e restaura agendamentos pendentes do SQLite após boot ou restart
 */
function initScheduler() {
    clearActiveTimers()

    const state = scheduleRepo.getOperationalState()
    const activeSchedules = scheduleRepo.getActiveSchedules()

    logger.info(`[BOOT] Inicializando Bot Scheduler. Estado operacional no banco: ${state} (${activeSchedules.length} agendamentos ativos)`)

    if (activeSchedules.length === 0) {
        if (state !== BOT_STATES.ONLINE && state !== BOT_STATES.OFFLINE && state !== BOT_STATES.MAINTENANCE) {
            setBotState(BOT_STATES.ONLINE)
        }
        return
    }

    const currentSchedule = activeSchedules[0]
    const now = Date.now()

    // 1. Fechamento por duração ou horário com reabertura pendente
    if (currentSchedule.reopen_at) {
        if (now < currentSchedule.execute_at) {
            // Ainda não chegou a hora de fechar
            setBotState(BOT_STATES.SCHEDULED_CLOSE)
            armCloseTimer(currentSchedule)
            logger.info(`[SCHEDULE_RESTORED] Fechamento agendado restaurado para ${formatarDataHora(currentSchedule.execute_at)}`)
        } else if (now >= currentSchedule.execute_at && now < currentSchedule.reopen_at) {
            // Está dentro do período em que o bot deve permanecer OFFLINE
            setBotState(BOT_STATES.OFFLINE)
            armReopenTimer(currentSchedule)
            logger.info(`[SCHEDULE_RESTORED] Estado OFFLINE restaurado. Reabertura programada para ${formatarDataHora(currentSchedule.reopen_at)}`)
        } else {
            // O período já expirou
            scheduleRepo.updateScheduleStatus(currentSchedule.id, 'COMPLETED')
            setBotState(BOT_STATES.ONLINE)
            logger.info(`[SCHEDULE_RESTORED] Agendamento ${currentSchedule.id} expirado durante restart. Bot restaurado para ONLINE.`)
        }
    } else if (currentSchedule.execute_at) {
        if (now < currentSchedule.execute_at) {
            setBotState(BOT_STATES.SCHEDULED_CLOSE)
            armCloseTimer(currentSchedule)
        } else {
            setBotState(BOT_STATES.OFFLINE)
            logger.info(`[SCHEDULE_RESTORED] Bot em modo OFFLINE INDEFINIDO após restart.`)
        }
    }
}

/**
 * Agenda fechamento temporário por duração (ex: .botclose 30m, 2h)
 */
function scheduleCloseDuration(durationStr, createdBy = 'OWNER') {
    const durationMs = parseDuration(durationStr)
    const now = Date.now()
    const executeAt = now
    const reopenAt = now + durationMs

    clearActiveTimers()
    scheduleRepo.cancelPendingSchedules()

    const id = `sched_${now}`
    scheduleRepo.createSchedule({
        id,
        action: 'CLOSE',
        executeAt,
        reopenAt,
        mode: 'DURATION',
        status: 'EXECUTING',
        createdBy
    })

    setBotState(BOT_STATES.OFFLINE)
    armReopenTimer({ id, reopen_at: reopenAt })

    logger.info(`[BOT_CLOSE_STARTED] Bot fechado temporariamente por ${durationStr} por ${createdBy}. Reabertura em: ${formatarDataHora(reopenAt)}`)

    return {
        id,
        durationStr,
        reopenAt,
        reopenAtFormatted: formatarHora(reopenAt)
    }
}

/**
 * Agenda fechamento e reabertura em horários específicos (ex: .botclose 23:00 07:00)
 */
function scheduleCloseAtTime(closeTimeStr, reopenTimeStr = null, createdBy = 'OWNER') {
    const closeTimestamp = parseTimeToTimestamp(closeTimeStr)
    let reopenTimestamp = null

    if (reopenTimeStr) {
        // Primeira vez que o relógio marca a reabertura DEPOIS do fechamento
        reopenTimestamp = parseTimeToTimestamp(reopenTimeStr, closeTimestamp)
    }

    clearActiveTimers()
    scheduleRepo.cancelPendingSchedules()

    const now = Date.now()
    const id = `sched_${now}`
    const mode = reopenTimeStr ? 'CYCLE' : 'TIME'

    scheduleRepo.createSchedule({
        id,
        action: 'CLOSE',
        executeAt: closeTimestamp,
        reopenAt: reopenTimestamp,
        mode,
        status: 'PENDING',
        createdBy
    })

    setBotState(BOT_STATES.SCHEDULED_CLOSE)
    armCloseTimer({ id, execute_at: closeTimestamp, reopen_at: reopenTimestamp })

    logger.info(`[SCHEDULE_CREATED] Fechamento agendado para ${formatarDataHora(closeTimestamp)}${reopenTimestamp ? `, reabertura às ${formatarDataHora(reopenTimestamp)}` : ''}`)

    return {
        id,
        closeTimestamp,
        reopenTimestamp,
        closeFormatted: formatarHora(closeTimestamp),
        reopenFormatted: reopenTimestamp ? formatarHora(reopenTimestamp) : 'Indefinido'
    }
}

/**
 * Fecha o bot indefinidamente (ex: .botclose indefinite)
 */
function scheduleCloseIndefinite(createdBy = 'OWNER') {
    clearActiveTimers()
    scheduleRepo.cancelPendingSchedules()

    const now = Date.now()
    const id = `sched_${now}`

    scheduleRepo.createSchedule({
        id,
        action: 'CLOSE',
        executeAt: now,
        reopenAt: null,
        mode: 'INDEFINITE',
        status: 'EXECUTING',
        createdBy
    })

    setBotState(BOT_STATES.OFFLINE)
    logger.info(`[BOT_CLOSE_STARTED] Bot fechado indefinidamente por ${createdBy}`)

    return { id }
}

/**
 * Marca a reabertura para um horário (ex: .botopen 07:00), sem mexer no fechamento.
 *
 * Antes o comando chamava scheduleCloseAtTime(horaAtual, 07:00): a hora atual,
 * sem segundos, "já tinha passado" e virava amanhã, então o bot fechava amanhã
 * neste horário e só reabria depois. Regras:
 *  - fechamento marcado e ainda não executado: mantém o fechamento e reabre na
 *    primeira vez que der o horário depois dele;
 *  - fechado agora (com ou sem prazo): continua fechado e reabre no horário;
 *  - aberto e sem nada marcado: não há o que reabrir (erro com code JA_ABERTO).
 */
function scheduleReopenAtTime(reopenTimeStr, createdBy = 'OWNER') {
    const now = Date.now()
    const active = scheduleRepo.getActiveSchedules()[0] || null
    const state = getBotState()

    if (!active && state !== BOT_STATES.OFFLINE) {
        const err = new Error('O bot já está aberto e não há fechamento marcado.')
        err.code = 'JA_ABERTO'
        throw err
    }

    const pendente = Boolean(active && active.status === 'PENDING')
    const executeAt = active ? active.execute_at : now
    const reopenAt = parseTimeToTimestamp(reopenTimeStr, pendente ? Math.max(executeAt, now) : now)
    const id = active ? active.id : `sched_${now}`

    clearActiveTimers()
    scheduleRepo.cancelPendingSchedules()
    scheduleRepo.createSchedule({
        id,
        action: 'CLOSE',
        executeAt,
        reopenAt,
        mode: 'CYCLE',
        status: pendente ? 'PENDING' : 'EXECUTING',
        createdBy
    })

    if (pendente) {
        setBotState(BOT_STATES.SCHEDULED_CLOSE)
        armCloseTimer({ id, execute_at: executeAt, reopen_at: reopenAt })
    } else {
        setBotState(BOT_STATES.OFFLINE)
        armReopenTimer({ id, reopen_at: reopenAt })
    }

    logger.info(`[SCHEDULE_CREATED] Reabertura marcada para ${formatarDataHora(reopenAt)} por ${createdBy}`)

    return {
        id,
        reopenTimestamp: reopenAt,
        reopenFormatted: formatarHora(reopenAt),
        fechamentoPendente: pendente,
        closeFormatted: pendente ? formatarHora(executeAt) : null
    }
}

/**
 * Reabre o bot imediatamente
 */
function openImmediately(createdBy = 'OWNER') {
    clearActiveTimers()
    scheduleRepo.cancelPendingSchedules()
    setBotState(BOT_STATES.ONLINE)
    logger.info(`[BOT_OPEN_COMPLETED] Bot reaberto imediatamente por ${createdBy}`)
}

/**
 * Cancela qualquer agendamento pendente
 */
function cancelActiveSchedule() {
    clearActiveTimers()
    const changes = scheduleRepo.cancelPendingSchedules()
    setBotState(BOT_STATES.ONLINE)
    return changes > 0
}

/**
 * Arma o timer para o fechamento programado
 */
function armCloseTimer(schedule) {
    const delay = schedule.execute_at - Date.now()
    if (delay <= 0) {
        executeClose(schedule)
        return
    }

    clearTimeout(activeCloseTimer)
    activeCloseTimer = setTimeout(() => {
        executeClose(schedule)
    }, delay)
}

/**
 * Executa a transição para OFFLINE quando chega o horário de fechamento
 */
function executeClose(schedule) {
    logger.info(`[BOT_CLOSE_COMPLETED] Executando fechamento programado (${schedule.id})`)
    setBotState(BOT_STATES.OFFLINE)
    scheduleRepo.updateScheduleStatus(schedule.id, 'EXECUTING')

    if (schedule.reopen_at) {
        armReopenTimer(schedule)
    }
}

/**
 * Arma o timer para a reabertura programada
 */
function armReopenTimer(schedule) {
    const delay = schedule.reopen_at - Date.now()
    if (delay <= 0) {
        executeReopen(schedule)
        return
    }

    clearTimeout(activeOpenTimer)
    activeOpenTimer = setTimeout(() => {
        executeReopen(schedule)
    }, delay)
}

/**
 * Executa a reabertura programada
 */
function executeReopen(schedule) {
    logger.info(`[BOT_OPEN_COMPLETED] Executando reabertura programada (${schedule.id})`)
    setBotState(BOT_STATES.ONLINE)
    scheduleRepo.updateScheduleStatus(schedule.id, 'COMPLETED')
}

function clearActiveTimers() {
    if (activeCloseTimer) clearTimeout(activeCloseTimer)
    if (activeOpenTimer) clearTimeout(activeOpenTimer)
    activeCloseTimer = null
    activeOpenTimer = null
}

/**
 * Formata o card visual de status do Scheduler
 */
function getScheduleStatusCard() {
    const state = getBotState()
    const active = scheduleRepo.getActiveSchedules()

    let statusEmoji = '🟢 ONLINE'
    if (state === BOT_STATES.OFFLINE) statusEmoji = '🔴 OFFLINE'
    else if (state === BOT_STATES.SCHEDULED_CLOSE) statusEmoji = '🟡 AGENDADO PARA FECHAR'
    else if (state === BOT_STATES.SCHEDULED_OPEN) statusEmoji = '🟡 AGENDADO PARA ABRIR'
    else if (state === BOT_STATES.MAINTENANCE) statusEmoji = '🔧 MODO MANUTENÇÃO'

    if (active.length === 0) {
        return `🤖 *BOT SCHEDULER*\n\n📊 *Status:* ${statusEmoji}\n⚙️ *Modo:* MANUAL\n\n_Nenhum agendamento ativo no momento._`
    }

    const sched = active[0]
    const now = Date.now()

    let proximaAcao = sched.status === 'EXECUTING' && sched.reopen_at ? '🟢 ABRIR' : '🔴 FECHAR'
    let proximoHorario = sched.status === 'EXECUTING' && sched.reopen_at ? sched.reopen_at : sched.execute_at
    let tempoRestanteMs = Math.max(0, proximoHorario - now)

    const horas = Math.floor(tempoRestanteMs / 3600000)
    const minutos = Math.floor((tempoRestanteMs % 3600000) / 60000)
    const tempoStr = `${String(horas).padStart(2, '0')}h ${String(minutos).padStart(2, '0')}min`

    const horarioStr = formatarHora(sched.execute_at)
    const reaberturaStr = sched.reopen_at ? formatarHora(sched.reopen_at) : 'Indefinido'

    return `🤖 *BOT SCHEDULER*

📊 *Status:* ${statusEmoji}
⚙️ *Modo:* ${sched.mode}

🎯 *Próxima ação:*
${proximaAcao}

🕒 *Horário:*
${horarioStr}

🔄 *Reabertura:*
${reaberturaStr}

⏳ *Tempo restante:*
${tempoStr}`
}

module.exports = {
    BOT_STATES,
    parseDuration,
    parseTimeToTimestamp,
    getBotState,
    setBotState,
    initScheduler,
    scheduleCloseDuration,
    scheduleCloseAtTime,
    scheduleCloseIndefinite,
    scheduleReopenAtTime,
    openImmediately,
    cancelActiveSchedule,
    getScheduleStatusCard,
    formatarHora,
    timezone
}
