const dataService = require('./dataService')
const rentalRepo = require('../database/repositories/rentalRepository')
const logger = require('../core/logger')

const INFINITE_KEYWORDS = ['inf', 'infinito', 'vitalicio', 'vitalício', 'permanente', 'ilimitado', 'sempre', '0']
const INFINITE_DURATION_MS = 300 * 365 * 24 * 60 * 60 * 1000 // ~300 anos

/**
 * Converte strings de duração (ex: '30d', '7d', '24h', '30m', '1y', 'inf') em milissegundos
 */
function parseRentalDuration(durationStr) {
    if (!durationStr || typeof durationStr !== 'string') return null
    const clean = durationStr.trim().toLowerCase()

    if (INFINITE_KEYWORDS.includes(clean)) {
        return INFINITE_DURATION_MS
    }

    // Formato com dígitos e unidade (ex: 30d, 7d, 24h, 15m, 1y)
    const match = clean.match(/^(\d+)\s*(s|m|h|d|sem|mes|ano|y)?$/)
    if (!match) return null

    const value = parseInt(match[1], 10)
    const unit = match[2] || 'd' // Default dias

    switch (unit) {
        case 's': return value * 1000
        case 'm': return value * 60 * 1000
        case 'h': return value * 60 * 60 * 1000
        case 'd': return value * 24 * 60 * 60 * 1000
        case 'sem': return value * 7 * 24 * 60 * 60 * 1000
        case 'mes': return value * 30 * 24 * 60 * 60 * 1000
        case 'ano':
        case 'y': return value * 365 * 24 * 60 * 60 * 1000
        default: return value * 24 * 60 * 60 * 1000
    }
}

/**
 * Formata milissegundos restantes em tempo legível
 */
function formatTimeRemaining(diffMs, isLifetime = false) {
    if (isLifetime || diffMs >= 50 * 365 * 24 * 60 * 60 * 1000) {
        return '♾️ TEMPO INFINITO (VITALÍCIO)'
    }

    if (diffMs <= 0) return '🔴 EXPIRADO'

    const segundosTotal = Math.floor(diffMs / 1000)
    const dias = Math.floor(segundosTotal / 86400)
    const horas = Math.floor((segundosTotal % 86400) / 3600)
    const minutos = Math.floor((segundosTotal % 3600) / 60)

    const partes = []
    if (dias > 0) partes.push(`${dias} dia${dias > 1 ? 's' : ''}`)
    if (horas > 0) partes.push(`${horas} hora${horas > 1 ? 's' : ''}`)
    if (minutos > 0 && dias === 0) partes.push(`${minutos} minuto${minutos > 1 ? 's' : ''}`)

    return partes.length > 0 ? partes.join(' e ') : 'Menos de 1 minuto'
}

const TARGET_TYPES = {
    GROUP: 'group',
    PV: 'pv',
    COMBO: 'combo',
    BOT: 'bot'
}

/**
 * Verifica se o Modo Aluguel está ativo globalmente, no grupo ou no PV
 * @param {string|null} scopeJid - JID do grupo ou do usuário
 * @param {boolean} isGroup - true se for mensagem de grupo, false se for privado
 */
/**
 * Padrão quando NADA foi configurado.
 *
 * Fica `true` (exige assinatura) de propósito: se os configs forem perdidos,
 * o erro seguro para um bot de aluguel é pedir assinatura, não abrir o bot de
 * graça para todo mundo. Está nomeado aqui em vez de ser um `return true`
 * solto no fim da cadeia, onde ninguém enxergava a decisão.
 */
const MODO_ALUGUEL_PADRAO = true

/**
 * Lê um flag que existe em dois formatos históricos: booleano cru
 * (`true`) ou objeto (`{ enabled: true }`).
 * @returns {boolean|undefined} undefined quando o flag não existe
 */
function lerFlag(valor) {
    if (valor === undefined || valor === null) return undefined
    if (typeof valor === 'object') return Boolean(valor.enabled)
    return Boolean(valor)
}

/**
 * Estado do Modo Aluguel COM a origem da decisão.
 *
 * A origem é o que permite explicar ao usuário POR QUE ele está bloqueado, em
 * vez de só devolver um "não pode". Precedência, da mais específica à mais geral:
 *   1. `grupo`  — ajuste daquele grupo   (só vale para grupos)
 *   2. `pv`     — ajuste do privado      (só vale para PV)
 *   3. `global` — ajuste global
 *   4. `padrao` — nada configurado
 *
 * @param {string|null} scopeJid
 * @param {boolean} isGroup
 * @returns {{enabled: boolean, origem: 'grupo'|'pv'|'global'|'padrao'}}
 */
function getRentalModeState(scopeJid = null, isGroup = true) {
    const configs = dataService.getConfigsData()

    if (isGroup && scopeJid) {
        const doGrupo = lerFlag(configs[scopeJid]?.rentalMode)
        if (doGrupo !== undefined) return { enabled: doGrupo, origem: 'grupo' }
    }

    if (!isGroup) {
        const doPv = lerFlag(configs.global?.rentalModePv) ?? lerFlag(configs.rentalModePv)
        if (doPv !== undefined) return { enabled: doPv, origem: 'pv' }
    }

    const global = lerFlag(configs.global?.rentalMode) ?? lerFlag(configs.rentalModeEnabled)
    if (global !== undefined) return { enabled: global, origem: 'global' }

    return { enabled: MODO_ALUGUEL_PADRAO, origem: 'padrao' }
}

/**
 * Modo Aluguel está ativo neste escopo?
 * Mantido para compatibilidade — a versão com origem é getRentalModeState.
 */
function isRentalModeEnabled(scopeJid = null, isGroup = true) {
    return getRentalModeState(scopeJid, isGroup).enabled
}

/**
 * Ativa ou desativa o Modo Aluguel
 * @param {boolean} enabled
 * @param {'global'|'grupo'|'pv'|string|null} scope
 */
async function setRentalMode(enabled, scope = null) {
    const configs = dataService.getConfigsData()
    const isBool = Boolean(enabled)

    if (!configs.global) configs.global = {}

    if (scope === 'pv' || scope === 'dm') {
        configs.global.rentalModePv = isBool
        configs.rentalModePv = { enabled: isBool }
    } else if (scope && scope.endsWith('@g.us')) {
        if (!configs[scope]) configs[scope] = {}
        configs[scope].rentalMode = isBool
    } else {
        configs.global.rentalMode = isBool
        configs.rentalModeEnabled = { enabled: isBool }
        // NÃO grava rentalModePv aqui. A precedência já faz o PV seguir o
        // global quando o flag do PV não existe; escrevê-lo à força só o
        // "grudava" no valor daquele momento, e a partir daí o PV parava de
        // acompanhar mudanças do global — surpresa silenciosa para o dono.
    }

    await dataService.saveConfigsData(configs)
    logger.info(`[RENTAL MODE] Modo Aluguel alterado para: ${isBool ? 'ATIVO' : 'DESATIVADO'} (Escopo: ${scope || 'GLOBAL'})`)
    return isBool
}

/**
 * Resolve de forma inteligente o alvo de aluguel:
 * - Número com ou sem DDI (+55 11 99999-9999, 5511999999999, 11999999999)
 * - Menções (@5511...)
 * - JIDs diretos (@s.whatsapp.net, @lid, @g.us)
 * - Busca por Nick ou Nome cadastrado no banco de dados SQLite
 */
async function resolveRentalTarget(input, context = {}) {
    const raw = (input || '').trim()
    const { from, isGroup = false, client = null } = context

    if (!raw) {
        if (isGroup && from) {
            let name = 'Grupo Atual'
            try {
                if (client) {
                    const m = await client.groupMetadata(from)
                    if (m?.subject) name = m.subject
                }
            } catch (errIgnorado) { logger.warn(`[RENTALSERVICE] Falha ignorada em src/services/rentalService.js:186: ${errIgnorado.message}`) }
            return { jid: from, name, type: 'group' }
        }
        return null
    }

    if (raw.endsWith('@g.us')) {
        let name = 'Grupo de WhatsApp'
        try {
            if (client) {
                const m = await client.groupMetadata(raw)
                if (m?.subject) name = m.subject
            }
        } catch (errIgnorado) { logger.warn(`[RENTALSERVICE] Falha ignorada em src/services/rentalService.js:199: ${errIgnorado.message}`) }
        return { jid: raw, name, type: 'group' }
    }

    if (raw.endsWith('@s.whatsapp.net') || raw.endsWith('@lid')) {
        let name = raw.split('@')[0]
        try {
            const userRepo = require('../database/repositories/userRepository')
            const u = userRepo.getUser(raw)
            if (u?.display_nick || u?.name) name = u.display_nick || u.name
        } catch (errIgnorado) { logger.warn(`[RENTALSERVICE] Falha ignorada em src/services/rentalService.js:209: ${errIgnorado.message}`) }
        return { jid: raw, name, type: 'pv' }
    }

    const digitsOnly = raw.replace(/\D/g, '')
    if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
        let phone = digitsOnly
        if ((digitsOnly.length === 10 || digitsOnly.length === 11) && !digitsOnly.startsWith('55')) {
            phone = '55' + digitsOnly
        }
        const userJid = `${phone}@s.whatsapp.net`
        let name = `+${phone}`
        try {
            const userRepo = require('../database/repositories/userRepository')
            const u = userRepo.getUser(userJid)
            if (u?.display_nick || u?.name) name = u.display_nick || u.name
        } catch (errIgnorado) { logger.warn(`[RENTALSERVICE] Falha ignorada em src/services/rentalService.js:225: ${errIgnorado.message}`) }
        return { jid: userJid, name, type: 'pv' }
    }

    try {
        const { getDatabase } = require('../database/connection')
        const db = getDatabase()
        const term = raw.toLowerCase()

        let row = db.prepare(`
            SELECT jid, name, display_nick FROM users 
            WHERE lower(display_nick) = ? OR lower(name) = ?
            ORDER BY level DESC, xp DESC LIMIT 1
        `).get(term, term)

        if (!row) {
            row = db.prepare(`
                SELECT jid, name, display_nick FROM users 
                WHERE lower(display_nick) LIKE ? OR lower(name) LIKE ?
                ORDER BY level DESC, xp DESC LIMIT 1
            `).get(`%${term}%`, `%${term}%`)
        }

        if (row && row.jid) {
            return {
                jid: row.jid,
                name: row.display_nick || row.name || row.jid.split('@')[0],
                type: row.jid.endsWith('@g.us') ? 'group' : 'pv'
            }
        }
    } catch (dbErr) {
        logger.warn('[RENTAL TARGET RESOLVE WARN]', dbErr.message)
    }

    return null
}

/**
 * Consulta se um alvo possui aluguel ativo (grupo ou PV)
 */
function hasActiveRental(targetJid, scope = 'group', candidateJids = []) {
    if (!targetJid) return { active: false, reason: 'no_target', rental: null }

    let allCandidates = [targetJid, ...(Array.isArray(candidateJids) ? candidateJids : [candidateJids])].filter(Boolean)
    if (scope === 'pv' || !targetJid.endsWith('@g.us')) {
        try {
            const userRepo = require('../database/repositories/userRepository')
            allCandidates = userRepo.resolveLinkedJids(allCandidates)
        } catch (errIgnorado) { logger.warn(`[RENTALSERVICE] Falha ignorada em src/services/rentalService.js:273: ${errIgnorado.message}`) }
    }

    const rental = rentalRepo.getRental(targetJid, allCandidates)
    if (!rental || !rental.isActive) {
        return { active: false, reason: 'not_found', rental: null }
    }

    if (scope === 'bot' && !['bot', 'combo'].includes(rental.targetType) && !rental.isLifetime) {
        return { active: false, reason: 'wrong_scope', rental }
    }

    const now = Date.now()
    const isLifetime = Boolean(rental.isLifetime) || (rental.expiresAt - now >= 50 * 365 * 86400 * 1000)
    if (!isLifetime && now > rental.expiresAt) {
        return { active: false, reason: 'expired', rental }
    }

    return {
        active: true,
        isLifetime,
        isTrial: Boolean(rental.isTrial),
        targetType: rental.targetType,
        remainingMs: isLifetime ? Infinity : Math.max(0, rental.expiresAt - now),
        rental
    }
}

/**
 * Registra ou substitui o aluguel
 */
function setRental({
    groupJid = '',
    targetJid = '',
    targetType = null,
    targetName = '',
    groupName = '',
    renterJid = '',
    rentedBy = '',
    durationStr = '30d',
    price = 0,
    pixKey = '',
    notes = '',
    isTrial = false,
    isLifetime = false
}) {
    const finalJid = targetJid || groupJid
    if (!finalJid) throw new Error('Destino do aluguel não informado.')

    const finalType = targetType || (finalJid.endsWith('@g.us') ? TARGET_TYPES.GROUP : TARGET_TYPES.PV)
    const finalName = targetName || groupName || ''

    const isInf = isLifetime || INFINITE_KEYWORDS.includes(String(durationStr).trim().toLowerCase())
    const durationMs = isInf ? INFINITE_DURATION_MS : parseRentalDuration(durationStr)

    if (!durationMs) {
        throw new Error(`Formato de duração inválido: "${durationStr}". Use: 30d, 7d, 24h, 15m, 60d, vitalicio.`)
    }

    const now = Date.now()
    const expiresAt = now + durationMs

    const rentalObj = {
        groupJid: finalJid,
        targetJid: finalJid,
        targetType: finalType,
        targetName: finalName,
        groupName: finalName,
        renterJid,
        rentedBy,
        startsAt: now,
        expiresAt,
        isActive: true,
        isTrial: Boolean(isTrial),
        isLifetime: Boolean(isInf),
        price: Number(price) || 0,
        paymentMethod: isInf ? 'Vitalício' : (isTrial ? 'Trial' : 'Pix'),
        pixKey: pixKey || '',
        notes: notes || ''
    }

    const saved = rentalRepo.saveRental(rentalObj)
    if (saved) {
        logger.info(`[RENTAL SET] Alvo ${finalJid} (${finalName}) [${finalType}] alugado por ${isInf ? 'VITALÍCIO' : durationStr} por ${rentedBy}`)
    }
    return rentalObj
}

/**
 * Concede aluguel vitalício (tempo infinito) para grupo, PV ou combo
 */
function setLifetimeRental({
    targetJid,
    targetType = null,
    targetName = '',
    grantedBy = '',
    price = 0,
    pixKey = '',
    notes = ''
}) {
    return setRental({
        targetJid,
        targetType,
        targetName,
        rentedBy: grantedBy,
        durationStr: 'vitalicio',
        isLifetime: true,
        price,
        pixKey,
        notes: notes || 'Acesso vitalício concedido por Dono'
    })
}

/**
 * Ativa período de teste gratuito (Trial) com proteção anti-abuso estrita
 */
function activateTrial({
    targetJid,
    targetType = null,
    targetName = '',
    durationStr = '2h',
    requestedBy = ''
}) {
    if (!targetJid) throw new Error('Alvo inválido para ativação de teste.')

    const finalType = targetType || (targetJid.endsWith('@g.us') ? TARGET_TYPES.GROUP : TARGET_TYPES.PV)

    let candidates = [targetJid]
    if (finalType === TARGET_TYPES.PV || !targetJid.endsWith('@g.us')) {
        try {
            const userRepo = require('../database/repositories/userRepository')
            candidates = userRepo.resolveLinkedJids(candidates)
        } catch (errIgnorado) { logger.warn(`[RENTALSERVICE] Falha ignorada em src/services/rentalService.js:405: ${errIgnorado.message}`) }
    }

    if (rentalRepo.hasUsedTrial(targetJid, candidates)) {
        throw new Error('Este alvo já utilizou o período de teste gratuito anteriormente.')
    }

    // Um aluguel pago (ou vitalício) ativo não pode ser trocado pelo teste:
    // setRental substitui a linha inteira e um grupo com 45 dias viraria 2h.
    // Recusa ANTES de marcar o teste como usado, para ele continuar disponível.
    const atual = hasActiveRental(targetJid, finalType === TARGET_TYPES.GROUP ? 'group' : 'pv', candidates)
    if (atual.active) {
        throw new Error('Este alvo já possui aluguel ativo; o teste gratuito não é necessário.')
    }

    const rentalObj = setRental({
        targetJid,
        targetType: finalType,
        targetName,
        renterJid: requestedBy || targetJid,
        rentedBy: requestedBy || 'Sistema (Teste Gratuito)',
        durationStr,
        isTrial: true,
        price: 0,
        notes: `Teste gratuito (${durationStr})`
    })

    rentalRepo.markTrialUsed(targetJid, finalType)
    logger.info(`[RENTAL TRIAL] Teste gratuito ativado para ${targetJid} (${finalType})`)
    return rentalObj
}

/**
 * Adiciona tempo extra a um aluguel existente
 */
function addRentalTime(targetJid, durationStr, rentedBy = '', targetType = null) {
    const durationMs = parseRentalDuration(durationStr)
    if (!durationMs) {
        throw new Error(`Formato de duração inválido: "${durationStr}". Use: 30d, 7d, 24h, 15m, 60d.`)
    }

    const current = rentalRepo.getRental(targetJid)
    const now = Date.now()
    const baseTime = (current && current.expiresAt > now) ? current.expiresAt : now
    const newExpiresAt = baseTime + durationMs

    const isInf = INFINITE_KEYWORDS.includes(String(durationStr).trim().toLowerCase()) || (current && current.isLifetime)
    const finalType = targetType || current?.targetType || (targetJid.endsWith('@g.us') ? TARGET_TYPES.GROUP : TARGET_TYPES.PV)

    const rentalObj = {
        groupJid: targetJid,
        targetJid,
        targetType: finalType,
        targetName: current?.targetName || current?.groupName || '',
        groupName: current?.groupName || '',
        renterJid: current?.renterJid || '',
        rentedBy: rentedBy || current?.rentedBy || '',
        startsAt: current?.startsAt || now,
        expiresAt: isInf ? now + INFINITE_DURATION_MS : newExpiresAt,
        isActive: true,
        isTrial: false,
        isLifetime: Boolean(isInf),
        price: current?.price || 0,
        paymentMethod: current?.paymentMethod || 'Pix',
        pixKey: current?.pixKey || '',
        notes: current?.notes || ''
    }

    rentalRepo.saveRental(rentalObj)
    logger.info(`[RENTAL EXTEND] Aluguel de ${targetJid} estendido por +${durationStr}`)
    return rentalObj
}

/**
 * Foto do aluguel como está agora, para desfazer uma mudança depois.
 * Devolve null quando o alvo não tem aluguel (desfazer então apaga a linha).
 */
function snapshotRental(targetJid) {
    const atual = rentalRepo.getRental(targetJid)
    return atual ? { ...atual } : null
}

/**
 * Desfaz uma mudança voltando o aluguel exatamente à foto tirada antes.
 * Existe porque subtrair tempo com addRentalTime('-30d') nunca funcionou:
 * parseRentalDuration recusa duração negativa e a reversão não acontecia.
 * @returns {boolean} true se o banco aceitou a restauração
 */
function restoreRental(targetJid, snapshot) {
    if (!targetJid) return false
    if (!snapshot) {
        const ok = rentalRepo.deleteRental(targetJid)
        logger.info(`[RENTAL RESTORE] Aluguel de ${targetJid} desfeito (não existia antes)`)
        return ok
    }
    const ok = rentalRepo.saveRental({ ...snapshot, targetJid, groupJid: targetJid })
    logger.info(`[RENTAL RESTORE] Aluguel de ${targetJid} voltou ao vencimento ${new Date(snapshot.expiresAt).toISOString()}`)
    return ok
}

/**
 * Remove / cancela o aluguel
 */
function removeRental(targetJid) {
    return rentalRepo.deleteRental(targetJid)
}

/**
 * Consulta informações completas de aluguel
 */
function getRentalInfo(targetJid, alternativeJids = []) {
    const r = rentalRepo.getRental(targetJid, alternativeJids)
    if (!r) return null

    const now = Date.now()
    const isLifetime = Boolean(r.isLifetime) || (r.expiresAt - now >= 50 * 365 * 86400 * 1000)
    const isExpired = !isLifetime && now > r.expiresAt
    const remainingMs = isLifetime ? Infinity : Math.max(0, r.expiresAt - now)
    const remainingText = formatTimeRemaining(remainingMs, isLifetime)

    const tz = process.env.BOT_TIMEZONE || 'America/Sao_Paulo'
    return {
        ...r,
        isLifetime,
        isExpired,
        remainingMs,
        remainingText,
        startsAtFormatted: new Date(r.startsAt).toLocaleString('pt-BR', { timeZone: tz }),
        expiresAtFormatted: isLifetime ? '♾️ Permanente (Vitalício)' : new Date(r.expiresAt).toLocaleString('pt-BR', { timeZone: tz })
    }
}

/**
 * Retorna todos os aluguéis registrados
 */
function getAllRentalsList(targetType = null) {
    const list = rentalRepo.getAllRentals(targetType)
    const now = Date.now()
    const tz = process.env.BOT_TIMEZONE || 'America/Sao_Paulo'

    return list.map(r => {
        const isLifetime = Boolean(r.isLifetime) || (r.expiresAt - now >= 50 * 365 * 86400 * 1000)
        const isExpired = !isLifetime && now > r.expiresAt
        const remainingMs = isLifetime ? Infinity : Math.max(0, r.expiresAt - now)
        return {
            ...r,
            isLifetime,
            isExpired,
            remainingMs,
            remainingText: formatTimeRemaining(remainingMs, isLifetime),
            startsAtFormatted: new Date(r.startsAt).toLocaleString('pt-BR', { timeZone: tz }),
            expiresAtFormatted: isLifetime ? '♾️ Permanente (Vitalício)' : new Date(r.expiresAt).toLocaleString('pt-BR', { timeZone: tz })
        }
    })
}

function getAllSubowners() {
    const all = rentalRepo.getAllRentals('bot') || []
    const now = Date.now()
    const tz = process.env.BOT_TIMEZONE || 'America/Sao_Paulo'
    return all.filter(r => r.isActive && (r.isLifetime || r.expiresAt > now)).map(r => {
        const isLifetime = Boolean(r.isLifetime) || (r.expiresAt - now >= 50 * 365 * 86400 * 1000)
        const remainingMs = isLifetime ? Infinity : Math.max(0, r.expiresAt - now)
        return {
            ...r,
            isLifetime,
            remainingMs,
            remainingText: formatTimeRemaining(remainingMs, isLifetime),
            expiresAtFormatted: isLifetime ? '♾️ Permanente (Vitalício)' : new Date(r.expiresAt).toLocaleString('pt-BR', { timeZone: tz })
        }
    })
}

/**
 * Verifica se um remetente é o Dono de Aluguel (Locatário) de um grupo ou PV
 * @param {string} senderJid - JID do remetente
 * @param {string|null} scopeJid - JID do grupo ou escopo
 * @param {boolean} isGroup - se é grupo ou PV
 * @returns {boolean}
 */
function isRentalOwner(senderJid, scopeJid = null, isGroup = true) {
    if (!senderJid) return false
    const cleanSender = String(senderJid).split(':')[0].split('@')[0].replace(/\D/g, '')
    if (!cleanSender) return false

    // Escopo do Privado (PV)
    if (!isGroup || (scopeJid && !scopeJid.endsWith('@g.us'))) {
        const pvRental = hasActiveRental(senderJid, 'pv')
        return Boolean(pvRental && pvRental.active)
    }

    // Escopo de Grupo
    const targetGroup = scopeJid || (senderJid.endsWith('@g.us') ? senderJid : null)
    if (!targetGroup) return false

    const groupRental = hasActiveRental(targetGroup, 'group')
    if (!groupRental || !groupRental.active) return false

    const r = groupRental.rental
    if (!r) return false

    // 1. Checagem direta de renterJid ou rentedBy salvo no aluguel
    const cleanRenter = String(r.renterJid || '').split(':')[0].split('@')[0].replace(/\D/g, '')
    const cleanRentedBy = String(r.rentedBy || '').split(':')[0].split('@')[0].replace(/\D/g, '')
    if (cleanRenter && cleanSender === cleanRenter) return true
    if (cleanRentedBy && cleanSender === cleanRentedBy) return true

    // 2. Checagem de locatário cadastrado nas configurações do grupo
    const configs = dataService.getConfigsData()
    const grpConfig = configs[targetGroup]
    if (grpConfig) {
        if (grpConfig.rentalOwnerJid) {
            const cleanConfigOwner = String(grpConfig.rentalOwnerJid).split(':')[0].split('@')[0].replace(/\D/g, '')
            if (cleanConfigOwner && cleanSender === cleanConfigOwner) return true
        }
        if (Array.isArray(grpConfig.rentalOwners)) {
            const isListed = grpConfig.rentalOwners.some(ojid => {
                const clean = String(ojid).split(':')[0].split('@')[0].replace(/\D/g, '')
                return clean && clean === cleanSender
            })
            if (isListed) return true
        }
    }

    return false
}

/**
 * Define ou transfere o Dono de Aluguel (Locatário) de um grupo
 * @param {string} targetJid - JID do grupo
 * @param {string} newOwnerJid - JID ou número do novo locatário
 * @param {string} actorJid - quem executou a alteração
 */
function setRentalOwner(targetJid, newOwnerJid, actorJid = '') {
    if (!targetJid || !newOwnerJid) throw new Error('Grupo e novo locatário devem ser informados.')
    const cleanDigits = String(newOwnerJid).replace(/\D/g, '')
    const cleanOwner = newOwnerJid.includes('@') ? newOwnerJid : `${cleanDigits}@s.whatsapp.net`

    // Atualiza no banco SQLite se houver registro de aluguel
    const current = rentalRepo.getRental(targetJid)
    if (current) {
        current.renterJid = cleanOwner
        current.notes = (current.notes ? current.notes + ' | ' : '') + `Locatário alterado por ${actorJid || 'sistema'}`
        rentalRepo.saveRental(current)
    }

    // Salva nas configurações do grupo
    const configs = dataService.getConfigsData()
    if (!configs[targetJid]) configs[targetJid] = {}
    configs[targetJid].rentalOwnerJid = cleanOwner
    dataService.saveConfigsData(configs)

    logger.info(`[RENTAL] Novo locatário do grupo ${targetJid} definido como ${cleanOwner} por ${actorJid}`)
    return cleanOwner
}

/**
 * Consulta informações do Dono de Aluguel atual do grupo
 * @param {string} targetJid
 */
function getRentalOwner(targetJid) {
    if (!targetJid) return null
    const info = getRentalInfo(targetJid)
    const configs = dataService.getConfigsData()
    const configOwner = configs[targetJid]?.rentalOwnerJid || null

    const ownerJid = (info && info.renterJid) || configOwner || null
    return {
        ownerJid,
        rental: info,
        isActive: Boolean(info && !info.isExpired)
    }
}

module.exports = {
    getRentalModeState,
    MODO_ALUGUEL_PADRAO,
    TARGET_TYPES,
    parseRentalDuration,
    formatTimeRemaining,
    isRentalModeEnabled,
    setRentalMode,
    resolveRentalTarget,
    hasActiveRental,
    setRental,
    setLifetimeRental,
    activateTrial,
    addRentalTime,
    snapshotRental,
    restoreRental,
    removeRental,
    getRentalInfo,
    getAllRentalsList,
    getAllSubowners,
    isRentalOwner,
    setRentalOwner,
    getRentalOwner
}

