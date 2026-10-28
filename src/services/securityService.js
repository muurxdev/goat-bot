/**
 * Security, Anti-Abuse & Rate Limiting Core Service
 * Implementa controle de janelas múltiplas, auto-silenciamento, auto-blacklist,
 * proteção contra flood e monitoramento de exaustão de memória na VPS.
 */

const os = require('os')
const securityRepo = require('../database/repositories/securityRepository')
const logger = require('../core/logger')

// Buckets de Rate Limit por usuário:
// { [sender]: { burstCount, burstStart, minuteCount, minuteStart, mutedUntil, penaltyLevel } }
const rateLimitBuckets = new Map()

const LIMITS = {
    BURST_WINDOW_MS: 5000,       // 5 segundos
    BURST_MAX_USER: 6,           // 6 requisições / 5s
    BURST_MAX_TRUSTED: 18,       // 18 requisições / 5s

    MINUTE_WINDOW_MS: 60000,     // 1 minuto
    MINUTE_MAX_USER: 25,         // 25 requisições / min
    MINUTE_MAX_TRUSTED: 70,      // 70 requisições / min

    FLOOD_ATTACK_MAX: 50,        // 50 requisições em menos de 1 minuto -> Auto-Blacklist

    MUTE_PENALTY_1_MS: 15000,    // 1º silenciamento: 15 segundos
    MUTE_PENALTY_2_MS: 60000     // 2º silenciamento: 1 minuto
}

/** "1 segundo", "15 segundos" — sempre inteiro, arredondado para cima. */
function formatarSegundos(seg) {
    const n = Math.max(1, Math.ceil(Number(seg) || 0))
    return `${n} ${n === 1 ? 'segundo' : 'segundos'}`
}

/**
 * Avalia requisições contra regras de Rate Limit e Anti-Abuse
 * @param {string} sender - JID do remetente
 * @param {boolean} isExempt - Se o usuário é isento (OWNER / BOT_ADMIN)
 * @param {boolean} isTrusted - Se o usuário é TRUSTED (limite estendido)
 * @returns {{ blocked: boolean, reason?: string, autoBanned?: boolean }}
 */
function checkRateLimit(sender, isExempt = false, isTrusted = false) {
    if (isExempt) return { blocked: false }

    const now = Date.now()
    const bucket = rateLimitBuckets.get(sender) || {
        burstCount: 0,
        burstStart: now,
        minuteCount: 0,
        minuteStart: now,
        mutedUntil: 0,
        penaltyLevel: 0
    }

    // 1. Verificação de Silenciamento Temporário Ativo
    if (now < bucket.mutedUntil) {
        const segRestantes = Math.ceil((bucket.mutedUntil - now) / 1000)
        return {
            blocked: true,
            reason: `⏳ Foram muitos comandos seguidos. Dê uma pausa de ${formatarSegundos(segRestantes)} e continue.`
        }
    }

    // 2. Janela de 1 Minuto (Anti-Flood Pesado)
    if (now - bucket.minuteStart > LIMITS.MINUTE_WINDOW_MS) {
        bucket.minuteCount = 1
        bucket.minuteStart = now
    } else {
        bucket.minuteCount += 1
    }

    // 3. Detecção de Ataque Flood Extremo -> Auto-Blacklist
    if (bucket.minuteCount >= LIMITS.FLOOD_ATTACK_MAX) {
        banUser(sender, 'Auto-Ban: Flood extremo de requisições (>50/min)', 'AntiAbuseSystem')
        logger.error(`[ANTI-ABUSE] Usuário ${sender} auto-banido por flood extremo (>50 cmds/min).`)
        return {
            blocked: true,
            autoBanned: true,
            reason: '🚫 Parei de responder a você por excesso de mensagens repetidas. Se achar que foi engano, fale com um dono do bot.'
        }
    }

    // 4. Janela de Burst Rápido (5 segundos)
    if (now - bucket.burstStart > LIMITS.BURST_WINDOW_MS) {
        bucket.burstCount = 1
        bucket.burstStart = now
    } else {
        bucket.burstCount += 1
    }

    const burstLimit = isTrusted ? LIMITS.BURST_MAX_TRUSTED : LIMITS.BURST_MAX_USER
    const minuteLimit = isTrusted ? LIMITS.MINUTE_MAX_TRUSTED : LIMITS.MINUTE_MAX_USER

    // 5. Excesso na Janela de Burst ou de Minuto -> Penalização
    if (bucket.burstCount > burstLimit || bucket.minuteCount > minuteLimit) {
        bucket.penaltyLevel += 1
        const penaltyDuration = bucket.penaltyLevel >= 2 ? LIMITS.MUTE_PENALTY_2_MS : LIMITS.MUTE_PENALTY_1_MS
        bucket.mutedUntil = now + penaltyDuration

        rateLimitBuckets.set(sender, bucket)
        const duracaoSeg = penaltyDuration / 1000

        logger.warn(`[ANTI-ABUSE] Rate limit excedido por ${sender} (Nível ${bucket.penaltyLevel}). Silenciado por ${duracaoSeg}s.`)
        return {
            blocked: true,
            reason: `⏳ Foram muitos comandos seguidos. Dê uma pausa de ${formatarSegundos(duracaoSeg)} e continue.`
        }
    }

    rateLimitBuckets.set(sender, bucket)
    return { blocked: false }
}

/**
 * Sanitiza expressões e entradas para prevenir injeção ou ataques ReDoS
 */
function sanitizeInput(text, maxLen = 500) {
    if (!text || typeof text !== 'string') return ''
    return text.replace(/[`$\";&|<>]/g, '').trim().slice(0, maxLen)
}

/**
 * Verifica a saúde de memória da VPS e previne estouro de 512MB
 */
function checkMemoryHealth(thresholdMb = 450) {
    const mem = process.memoryUsage()
    const rssMb = Math.round(mem.rss / 1024 / 1024)
    return {
        healthy: rssMb < thresholdMb,
        rssMb,
        thresholdMb
    }
}

/**
 * Verifica se o usuário está na Blacklist global
 */
function isUserBanned(sender) {
    return securityRepo.isBlacklisted(sender)
}

/**
 * Adiciona um usuário à Blacklist
 */
function banUser(sender, motivo, autor) {
    securityRepo.addBlacklist(sender, motivo, autor)
    logger.info(`[BLACKLIST] Usuário ${sender} banido por ${autor}. Motivo: ${motivo}`)
}

/**
 * Remove um usuário da Blacklist
 */
function unbanUser(sender) {
    securityRepo.removeBlacklist(sender)
    logger.info(`[BLACKLIST] Usuário ${sender} desbanido.`)
}

/**
 * Consulta a lista completa de usuários banidos
 */
function getBannedUsers() {
    return securityRepo.getBlacklist()
}

/**
 * Verifica se o Modo Manutenção está ativo
 */
function isMaintenanceActive() {
    return !!securityRepo.getSetting('maintenance_mode', false)
}

/**
 * Ativa ou desativa o Modo Manutenção
 */
function setMaintenance(status) {
    securityRepo.setSetting('maintenance_mode', !!status)
    logger.info(`[MAINTENANCE] Modo manutenção configurado para: ${status}`)
}

/**
 * Coleta métricas de recursos do host
 */
function getSystemMetrics() {
    const mem = process.memoryUsage()
    const uptimeSec = process.uptime()
    const horas = Math.floor(uptimeSec / 3600)
    const minutos = Math.floor((uptimeSec % 3600) / 60)
    const segundos = Math.floor(uptimeSec % 60)

    return {
        uptime: `${horas}h ${minutos}m ${segundos}s`,
        nodeVersion: process.version,
        platform: `${os.type()} ${os.arch()}`,
        ramUsedMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        cpus: os.cpus().length,
        freeMemMb: Math.round(os.freemem() / 1024 / 1024),
        totalMemMb: Math.round(os.totalmem() / 1024 / 1024)
    }
}

/**
 * Detecta mensagens do tipo TravaZap / payloads de travamento malicioso
 * @param {string} text - Mensagem a ser analisada
 * @returns {{ isTrava: boolean, reason?: string }}
 */
function detectTravaZap(text) {
    if (!text || typeof text !== 'string') return { isTrava: false }

    // 1. Mensagem gigantesca (> 20.000 caracteres)
    if (text.length > 20000) {
        return { isTrava: true, reason: 'Tamanho desproporcional (> 20k caracteres)' }
    }

    // 2. Caracteres invisíveis / formatadores RTL maliciosos repetidos
    const invisibleMatches = text.match(/[\u200B-\u200F\u202A-\u202E\uFEFF\u00AD]/g)
    if (invisibleMatches && (invisibleMatches.length > 80 || (invisibleMatches.length / text.length > 0.25 && text.length > 50))) {
        return { isTrava: true, reason: 'Excesso de caracteres invisíveis / RTL maliciosos' }
    }

    // 3. Sequências repetitivas anormais de diacríticos combinantes (Zalgo / Trava Texto)
    const combiningMarks = text.match(/[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/g)
    if (combiningMarks && combiningMarks.length > 150) {
        return { isTrava: true, reason: 'Excesso de diacríticos combinantes (Zalgo attack)' }
    }

    return { isTrava: false }
}

const groupSpamTracker = new Map()

/**
 * Monitora e previne flood/spam em grupos
 * @param {string} from - JID do grupo
 * @param {string} sender - JID do remetente
 * @param {number} maxMsgs - Máximo de msgs em janela curta (default 5)
 * @param {number} windowMs - Janela de tempo em ms (default 3000)
 * @returns {{ isSpam: boolean, count: number }}
 */
function checkGroupSpam(from, sender, maxMsgs = 5, windowMs = 3000) {
    const key = `${from}_${sender}`
    const now = Date.now()
    const record = groupSpamTracker.get(key) || { count: 0, firstMsgTime: now }

    if (now - record.firstMsgTime > windowMs) {
        record.count = 1
        record.firstMsgTime = now
    } else {
        record.count += 1
    }

    groupSpamTracker.set(key, record)

    if (record.count > maxMsgs) {
        return { isSpam: true, count: record.count }
    }
    return { isSpam: false, count: record.count }
}

module.exports = {
    checkRateLimit,
    sanitizeInput,
    checkMemoryHealth,
    isUserBanned,
    banUser,
    unbanUser,
    getBannedUsers,
    isMaintenanceActive,
    setMaintenance,
    getSystemMetrics,
    detectTravaZap,
    checkGroupSpam,
    LIMITS
}
