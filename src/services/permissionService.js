/**
 * 5-Tier Permission & Hierarchy Service
 *
 * HIERARQUIA DE PERMISSÕES:
 * 5 - OWNER        (Dono do bot — controle absoluto de infraestrutura, bans globais e configurações)
 * 4 - BOT_ADMIN    (Administrador Global do bot — pode gerenciar moderação e promover até TRUSTED)
 * 3 - GROUP_ADMIN  (Administrador do Grupo WhatsApp — pode gerenciar antilink, kick e warns do grupo)
 * 2 - TRUSTED      (Usuário Confiável — isenções de limites de spam e acesso prioritário)
 * 1 - USER         (Usuário Comum — permissões padrão de comandos de economia e RPG)
 */

const env = require('../config/env')
const permissionRepo = require('../database/repositories/permissionRepository')
const logger = require('../core/logger')

const ROLES = {
    OWNER: 5,
    BOT_ADMIN: 4,
    RENTAL_OWNER: 3.5,
    GROUP_ADMIN: 3,
    TRUSTED: 2,
    USER: 1
}

const ROLE_NAMES = {
    5: 'OWNER',
    4: 'BOT_ADMIN',
    3.5: 'RENTAL_OWNER',
    3: 'GROUP_ADMIN',
    2: 'TRUSTED',
    1: 'USER'
}

/**
 * Nome do cargo como o usuário lê. ROLE_NAMES continua sendo o identificador
 * interno (gravado no banco e comparado no código); este mapa é só exibição.
 */
const ROLE_LABELS = {
    5: 'Dono do bot',
    4: 'Administrador do bot',
    3.5: 'Dono de aluguel (locatário)',
    3: 'Administrador do grupo',
    2: 'Membro de confiança',
    1: 'Membro'
}

/** Resposta única para comando que só funciona em grupo (dispatcher usa a mesma). */
function mensagemSoGrupo(nomeComando) {
    return `👥 Esse comando funciona só dentro de grupos. Use o \`.${nomeComando}\` em um grupo onde eu esteja.`
}

/**
 * Determina o nível de cargo (1 a 5) e o nome do cargo do remetente
 * @param {string} sender - JID do remetente
 * @param {boolean} isGroupAdmin - Se o remetente é admin do grupo WhatsApp
 * @param {boolean} isOwnerFlag - Se a flag de dono está ativa
 * @param {object} context - Contexto opcional ({ from, isGroup })
 * @returns {{ level: number, name: string, isRentalOwner?: boolean, rental?: object }}
 */
function resolveUserRole(sender, isGroupAdmin = false, isOwnerFlag = false, context = {}) {
    const cleanSender = sender?.split(':')[0] || ''

    // 1. Checagem de Dono (Nível 5)
    if (isOwnerFlag === true || (isOwnerFlag !== false && env.isOwnerJid(cleanSender))) {
        return { level: ROLES.OWNER, name: 'OWNER' }
    }
    try {
        const ownerService = require('./ownerService')
        if (ownerService.isOwner(sender)) {
            return { level: ROLES.OWNER, name: 'OWNER' }
        }
    } catch (err) {
        // Roda em todo comando: avisa uma vez, depois só em debug.
        logger.warnOnce(`resolveUserRole:${err.message}`, `[PERMISSION] resolveUserRole: checagem de dono via ownerService falhou para ${sender}, sigo pelo banco: ${err.message}`)
    }

    // 2. Checagem de Cargo no Banco de Dados SQLite
    const savedRole = permissionRepo.getUserRole(sender)
    if (savedRole?.role === 'OWNER') {
        return { level: ROLES.OWNER, name: 'OWNER' }
    }
    if (savedRole?.role === 'BOT_ADMIN') {
        return { level: ROLES.BOT_ADMIN, name: 'BOT_ADMIN' }
    }

    // 3. Checagem de Dono de Aluguel / Locatário Ativo (Nível 3.5 - Tempo Determinado)
    if (context && (context.from || context.isGroup !== undefined)) {
        try {
            const rentalService = require('./rentalService')
            const scopeJid = context.from || sender
            const isGrp = context.isGroup !== undefined ? Boolean(context.isGroup) : scopeJid.endsWith('@g.us')
            if (rentalService.isRentalOwner(sender, scopeJid, isGrp)) {
                const info = rentalService.getRentalInfo ? rentalService.getRentalInfo(scopeJid) : null
                return {
                    level: ROLES.RENTAL_OWNER,
                    name: 'RENTAL_OWNER',
                    isRentalOwner: true,
                    rental: info
                }
            }
        } catch (err) {
            logger.warnOnce(`resolveUserRole:rental:${err.message}`, `[PERMISSION] resolveUserRole: checagem de aluguel falhou: ${err.message}`)
        }
    }

    // 4. Checagem de Administrador de Grupo (Nível 3)
    if (isGroupAdmin) {
        return { level: ROLES.GROUP_ADMIN, name: 'GROUP_ADMIN' }
    }

    // 5. Checagem de Lista TRUSTED (Nível 2)
    if (savedRole?.role === 'TRUSTED' || permissionRepo.isTrusted(sender)) {
        return { level: ROLES.TRUSTED, name: 'TRUSTED' }
    }

    // 6. Usuário Comum (Nível 1)
    return { level: ROLES.USER, name: 'USER' }
}

/**
 * Promove um usuário para um cargo superior
 * Regras:
 * - Somente OWNER pode promover para BOT_ADMIN ou OWNER.
 * - BOT_ADMIN pode promover para TRUSTED.
 */
function promoteUser(targetJid, newRole, actorJid, actorRoleLevel) {
    const targetRole = newRole.toUpperCase()
    const targetLevel = ROLES[targetRole] || ROLES.TRUSTED

    if (targetLevel > actorRoleLevel) {
        throw new Error(`Permissão insuficiente: você não pode atribuir um cargo superior ou igual ao seu nível (${actorRoleLevel}).`)
    }

    if (targetLevel === ROLES.BOT_ADMIN && actorRoleLevel < ROLES.OWNER) {
        throw new Error('Somente o OWNER pode nomear BOT_ADMIN.')
    }

    permissionRepo.setUserRole(targetJid, targetRole, actorJid)
    if (targetRole === 'TRUSTED') {
        permissionRepo.setTrusted(targetJid, true, actorJid, 'Promovido via .up')
    }

    return {
        targetJid,
        role: targetRole,
        level: targetLevel
    }
}

/**
 * Rebaixa um usuário na hierarquia para USER
 */
function demoteUser(targetJid, actorJid, actorRoleLevel) {
    const currentTarget = resolveUserRole(targetJid)

    if (currentTarget.level >= actorRoleLevel && actorRoleLevel < ROLES.OWNER) {
        throw new Error('Permissão insuficiente: você não pode rebaixar alguém com nível igual ou superior ao seu.')
    }

    permissionRepo.removeUserRole(targetJid)
    permissionRepo.setTrusted(targetJid, false)

    return {
        targetJid,
        role: 'USER',
        level: ROLES.USER
    }
}

/**
 * Normaliza um JID removendo o sufixo de dispositivo preservando o domínio
 * ("639...:10@s.whatsapp.net" -> "639...@s.whatsapp.net")
 * @param {string} jid
 * @returns {string}
 */
function normalizeJid(jid = '') {
    if (typeof jid !== 'string' || !jid) return ''
    const at = jid.indexOf('@')
    if (at === -1) return jid.split(':')[0]
    return jid.slice(0, at).split(':')[0] + jid.slice(at)
}

/**
 * Verifica se o BOT é administrador do grupo com base no metadata E nos JIDs do bot.
 * Puro e testável: recebe o groupMetadata do Baileys e o JID (ou lista de JIDs) do bot.
 *
 * Estados suportados pelo Baileys: 'admin' e 'superadmin'.
 *
 * @param {object} groupMetadata - Retorno de client.groupMetadata(jid)
 * @param {string|string[]} botJids - JID(s) do bot (número real e/ou LID)
 * @returns {boolean}
 */
function isBotAdmin(groupMetadata, botJids) {
    if (!groupMetadata || !Array.isArray(groupMetadata.participants)) return false

    const ids = Array.isArray(botJids) ? botJids : [botJids]
    const normalized = new Set(ids.filter(Boolean).map(normalizeJid))

    return groupMetadata.participants.some(p => {
        if (!p || !p.id) return false
        const pid = normalizeJid(p.id)
        return normalized.has(pid) && (p.admin === 'admin' || p.admin === 'superadmin')
    })
}

/**
 * Determina a hierarquia canônica de um comando: 'user' | 'adm' | 'locatario' | 'dono'
 * @param {object} cmd
 * @returns {'user'|'adm'|'locatario'|'dono'}
 */
function getCommandHierarchy(cmd) {
    if (!cmd) return 'user'
    const cat = String(cmd.category || '').toLowerCase()
    const sub = String(cmd.subcategory || '').toLowerCase()
    if (cmd.ownerOnly || (cmd.minRole && cmd.minRole >= ROLES.BOT_ADMIN) ||
        cat === 'dono' || cat === 'owner' || cat === 'dev' ||
        sub.includes('dono') || sub.includes('gestão do bot')) {
        return 'dono'
    }
    if (cmd.rentalOnly || (cmd.minRole && cmd.minRole === ROLES.RENTAL_OWNER) ||
        sub.includes('locatário') || sub.includes('locatario')) {
        return 'locatario'
    }
    if (cmd.adminOnly || (cmd.minRole && cmd.minRole === ROLES.GROUP_ADMIN) ||
        cat === 'admin' || cat === 'moderacao' || cat === 'administracao' ||
        sub.includes('moderação') || sub.includes('administração')) {
        return 'adm'
    }
    return 'user'
}

/**
 * Avalia se o usuário possui permissão para executar um comando específico
 * com restrição estrita por hierarquia (USER -> ADM -> LOCATÁRIO -> DONO)
 * @param {{ level: number, name: string }} userRole - Cargo do usuário
 * @param {object} cmd - Definição do comando
 * @param {object} context - Contexto da mensagem ({ isGroup, isBotAdmin })
 * @returns {{ allowed: boolean, reason?: string, hierarchy?: string }}
 */
function canExecuteCommand(userRole, cmd, context = {}) {
    if (cmd.groupOnly && !context.isGroup) {
        return {
            allowed: false,
            reason: mensagemSoGrupo(cmd.name)
        }
    }

    const hierarchy = getCommandHierarchy(cmd)

    // 0. Restrição Estrita: Nível LOCATÁRIO / DONO DE ALUGUEL (Level 3.5)
    if (hierarchy === 'locatario' && userRole.level < ROLES.RENTAL_OWNER) {
        return {
            allowed: false,
            hierarchy: 'locatario',
            reason: `💼 O comando \`.${cmd.name}\` é exclusivo para o *DONO DE ALUGUEL (LOCATÁRIO)* ativo deste grupo.`
        }
    }

    // 1. Restrição Estrita: Nível DONO (Level 4 e 5: BOT_ADMIN / OWNER)
    const minDonoLevel = cmd.ownerOnly ? ROLES.OWNER : (cmd.minRole || ROLES.BOT_ADMIN)
    if (hierarchy === 'dono' && userRole.level < minDonoLevel) {
        const isAdm = userRole.level >= ROLES.GROUP_ADMIN
        return {
            allowed: false,
            hierarchy: 'dono',
            reason: isAdm
                ? `🔒 O comando \`.${cmd.name}\` pertence à hierarquia de *DONO DO BOT*. Administradores de grupo não têm permissão para executá-lo.`
                : `🔒 O comando \`.${cmd.name}\` pertence à hierarquia de *DONO DO BOT*. Para falar com os donos, use \`.dono\`.`
        }
    }

    // 2. Restrição Estrita: Nível ADMIN DE GRUPO (Level 3)
    if (hierarchy === 'adm' && userRole.level < ROLES.GROUP_ADMIN) {
        return {
            allowed: false,
            hierarchy: 'adm',
            reason: `🛡️ O comando \`.${cmd.name}\` pertence à hierarquia de *ADMINISTRADOR DO GRUPO*. Membros comuns não têm permissão para executá-lo.`
        }
    }

    // 3. Verificação explícita de minRole customizado
    if (cmd.minRole && userRole.level < cmd.minRole) {
        const cargoNecessario = ROLE_LABELS[cmd.minRole] || ROLE_NAMES[cmd.minRole] || 'superior'
        const cargoAtual = ROLE_LABELS[userRole.level] || ROLE_LABELS[ROLES.USER]
        return {
            allowed: false,
            reason: `🔒 O comando \`.${cmd.name}\` exige a hierarquia *${cargoNecessario}* ou superior. Sua hierarquia atual é *${cargoAtual}*.`
        }
    }

    // 4. Verificação de permissão do próprio bot no grupo
    if ((cmd.botAdminOnly || cmd.botAdminRequired) && !context.isBotAdmin) {
        return {
            allowed: false,
            reason: '⚠️ Preciso ser administrador do grupo para executar este comando. Me promova a admin e tente de novo.'
        }
    }

    return { allowed: true, hierarchy }
}

module.exports = {
    ROLES,
    ROLE_NAMES,
    ROLE_LABELS,
    mensagemSoGrupo,
    resolveUserRole,
    promoteUser,
    demoteUser,
    isBotAdmin,
    canExecuteCommand,
    getCommandHierarchy,
    permissionRepo
}
