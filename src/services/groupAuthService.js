/**
 * Group Auth Service
 * Autenticação de administração de grupos do WhatsApp.
 *
 * Responsável por confirmar, com dados frescos e tolerantes a LID/dispositivo:
 *  - se um usuário é ADM do grupo
 *  - se o BOT é ADM do grupo (pré-requisito para .promote/.demote/kick/etc)
 *  - listar os administradores atuais
 *
 * O cache com TTL curto evita chamadas excessivas de groupMetadata, e o
 * evento groups.participants.update invalida na hora via invalidate().
 */

const logger = require('../core/logger')

let currentClient = null

// groupJid -> { data, participants, admins:Set<string>, botParticipant, isBotAdmin, time }
const cache = new Map()

// LID (ex: 12345@lid) -> JID real (ex: 55...@s.whatsapp.net)
// Preenchido via signalRepository.lidMapping.getPNForLID do Baileys v7.
const lidToRealJid = new Map()

// Número real sem domínio ('55...') -> LID (ex: 12345@lid)
// Preenchido via signalRepository.lidMapping.getLIDForPN do Baileys v7.
// Necessário para ações de grupo (promote/demote/kick) quando o grupo
// opera com LID e o alvo foi mencionado/fornecido como número real.
const pnToLid = new Map()

const TTL_MS = 20000

/**
 * Vincula o cliente Baileys ao serviço
 * @param {object} client - Socket Baileys
 */
function attach(clientInstance) {
    currentClient = clientInstance
}

/**
 * Socket Baileys vinculado no momento (ou null antes de conectar). Para
 * serviços com relógio próprio, que não recebem o client por parâmetro.
 */
function getClient() {
    return currentClient
}

/**
 * Remove o sufixo de dispositivo de um JID preservando o domínio:
 *   "5511...:10@s.whatsapp.net" -> "5511...@s.whatsapp.net"
 *   "12345:7@lid"               -> "12345@lid"
 * @param {string} jid
 * @returns {string}
 */
function normalizeJid(jid = '') {
    if (typeof jid !== 'string') return ''
    const at = jid.indexOf('@')
    if (at === -1) return jid.split(':')[0]
    return jid.slice(0, at).split(':')[0] + jid.slice(at)
}

/**
 * Compara dois JIDs com tolerância a sufixo de dispositivo
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function sameUser(a, b) {
    const na = normalizeJid(a)
    const nb = normalizeJid(b)
    return Boolean(na && nb && na === nb)
}

/**
 * Retorna os JIDs do BOT (número real + LID) normalizados, sem sufixo de dispositivo.
 * Fonte única da identidade do bot para comparações de participante/admin.
 * @param {object} [client] - Socket Baileys (usa o vinculado se omitido)
 * @returns {Set<string>}
 */
function getBotJids(client) {
    const jids = new Set()
    const user = (client || currentClient)?.user
    if (user) {
        if (user.id) jids.add(normalizeJid(user.id))
        if (user.lid) jids.add(normalizeJid(user.lid))
    }
    return jids
}

/**
 * Diz se um JID é o próprio bot, em qualquer forma: número, LID, com ou sem
 * sufixo de dispositivo.
 *
 * Existe porque comparar só os dígitos do número falha em grupo LID: o
 * .rebaixartodos rebaixava o próprio bot, a menção ao bot não era detectada e o
 * bot se parabenizava ao ser promovido. Toda pergunta "é o bot?" passa por aqui.
 * @param {string} jid
 * @param {object} [client]
 * @returns {boolean}
 */
function isBotJid(jid, client) {
    const n = normalizeJid(typeof jid === 'string' ? jid : (jid?.id || jid?.jid || ''))
    return Boolean(n) && getBotJids(client).has(n)
}

/**
 * Extrai o JID do participante remetente de uma mensagem de grupo (normalizado),
 * com fallback para o remoteJid em conversas diretas.
 * @param {object} info - Estrutura da mensagem recebida (upsert)
 * @returns {string}
 */
function getParticipantJid(info) {
    const key = info?.key || {}
    if (key.participant) return normalizeJid(key.participant)
    if (key.remoteJid) return normalizeJid(key.remoteJid)
    return ''
}

/**
 * Resolve o JID REAL (número @s.whatsapp.net) por trás de um LID do participante,
 * usando o mapeamento interno do Baileys (signalRepository.lidMapping).
 * Em grupos com LID habilitado, key.participant vem como @lid — sem resolver,
 * a verificação de Owner/BOT_ADMIN do banco falha para quem é dono/admin.
 *
 * @param {object} [client] - Socket Baileys (usa o vinculado se omitido)
 * @param {string} rawJid - JID do remetente (pode ser LID ou número real)
 * @returns {Promise<string>} JID real normalizado (@s.whatsapp.net) ou o original normalizado
 */
async function resolveRealJid(client, rawJid) {
    if (!rawJid) return ''
    const norm = normalizeJid(rawJid)
    if (!norm.endsWith('@lid')) return norm

    const cached = lidToRealJid.get(norm)
    if (cached) return cached

    const repo = (client || currentClient)?.signalRepository?.lidMapping
    if (!repo || typeof repo.getPNForLID !== 'function') return norm

    try {
        const pnJid = await repo.getPNForLID(norm)
        if (pnJid) {
            const real = normalizeJid(pnJid)
            if (real.endsWith('@s.whatsapp.net')) {
                if (lidToRealJid.size > 1000) {
                    lidToRealJid.delete(lidToRealJid.keys().next().value)
                }
                lidToRealJid.set(norm, real)
                return real
            }
        }
    } catch (err) {
        logger.warn(`[LID RESOLVE WARN] Falha ao resolver ${norm}: ${err.message}`)
    }
    return norm
}

/**
 * Descobre o "namespace" de IDs usado pelo grupo (observando os participantes).
 * Grupos com LID habilitado tem participantes @lid; os demais usam @s.whatsapp.net.
 * @param {object} groupData - Dados do grupo (groupMetadata normalizado)
 * @returns {'lid'|'pn'}
 */
function getGroupIdNamespace(groupData) {
    const sample = Array.isArray(groupData?.participants) ? groupData.participants[0] : null
    return sample && String(sample.id || '').includes('@lid') ? 'lid' : 'pn'
}

/**
 * Resolve o JID de um alvo para o namespace de IDs do grupo.
 *
 * Problema: em grupos com LID habilitado, o WhatsApp só aceita o @lid de um
 * participante em groupParticipantsUpdate (promote/demote/kick). Se o alvo foi
 * mencionado/fornecido como número real (@s.whatsapp.net), a chamada de API
 * falha silenciosamente e o participante "não sobe de cargo". Este resolver
 * converte entre real <-> LID usando o mapeamento interno do Baileys.
 *
 * @param {object} [client] - Socket Baileys (usa o vinculado se omitido)
 * @param {string} rawJid - JID do alvo (real, LID ou com sufixo de dispositivo)
 * @param {object|string} groupJidOrData - JID do grupo, ou groupData já buscado
 * @returns {Promise<string>} JID no namespace do grupo (normalizado) ou o original
 */
async function resolveMemberJid(client, rawJid, groupJidOrData) {
    if (!rawJid) return ''
    const norm = normalizeJid(rawJid)

    let groupData = null
    if (groupJidOrData && typeof groupJidOrData === 'object' && Array.isArray(groupJidOrData.participants)) {
        groupData = groupJidOrData
    } else if (typeof groupJidOrData === 'string' && groupJidOrData) {
        try {
            groupData = await getGroupData(groupJidOrData)
        } catch (_) {
            return norm
        }
    }

    const namespace = getGroupIdNamespace(groupData)
    const repo = (client || currentClient)?.signalRepository?.lidMapping

    if (namespace === 'lid') {
        // Grupo opera com LID: alvo precisa estar em @lid
        if (norm.endsWith('@lid')) return norm

        const pn = norm.split('@')[0]
        if (!pn) return norm

        const cached = pnToLid.get(pn)
        if (cached) return cached

        let lid = null
        if (repo && typeof repo.getLIDForPN === 'function') {
            try {
                lid = await repo.getLIDForPN(pn)
            } catch (err) {
                logger.warn(`[LID RESOLVE WARN] getLIDForPN de ${pn} falhou: ${err.message}`)
            }
        }
        if (lid) {
            const lidNorm = normalizeJid(lid)
            if (lidNorm.endsWith('@lid')) {
                if (pnToLid.size > 1000) {
                    pnToLid.delete(pnToLid.keys().next().value)
                }
                pnToLid.set(pn, lidNorm)
                return lidNorm
            }
        }

        // Fallback robusto: escaneia os participantes do grupo (são @lid) e
        // resolve cada um via getPNForLID — que funciona mesmo offline com os
        // arquivos reversos do session. Evita depender do cache do USync.
        if (Array.isArray(groupData?.participants) && repo && typeof repo.getPNForLID === 'function') {
            for (const participant of groupData.participants) {
                const pid = String(participant?.id || '')
                if (!pid.endsWith('@lid')) continue
                try {
                    const pnJid = await repo.getPNForLID(pid)
                    if (pnJid && normalizeJid(pnJid).split('@')[0] === pn) {
                        const lidNorm = normalizeJid(pid)
                        if (pnToLid.size > 1000) {
                            pnToLid.delete(pnToLid.keys().next().value)
                        }
                        pnToLid.set(pn, lidNorm)
                        return lidNorm
                    }
                } catch (_) {
                    // continua tentando os demais participantes
                }
            }
        }
        return norm
    }

    // Grupo opera com número real: LID precisa virar @s.whatsapp.net
    if (norm.endsWith('@lid')) {
        const real = await resolveRealJid(client, norm)
        if (real.endsWith('@s.whatsapp.net')) return real
    }
    return norm
}

/**
 * Busca os dados do grupo no WhatsApp (sem cache)
 * @param {string} groupJid
 * @returns {Promise<object>} dados normalizados do grupo
 */
async function fetchGroupData(groupJid) {
    const client = currentClient
    if (!client || typeof client.groupMetadata !== 'function') {
        throw new Error('Cliente Baileys não vinculado ao GroupAuthService')
    }

    const data = await client.groupMetadata(groupJid)
    const participants = (Array.isArray(data.participants) ? data.participants : []).filter(p => p && p.id)

    const botJids = getBotJids(client)

    const isAdminParticipant = p => p.admin === 'admin' || p.admin === 'superadmin'

    const admins = new Set()
    participants.forEach(p => {
        if (isAdminParticipant(p)) admins.add(normalizeJid(p.id))
    })

    const botParticipant = participants.find(p => botJids.has(normalizeJid(p.id)))

    return {
        data,
        participants,
        admins,
        botParticipant,
        isBotAdmin: Boolean(botParticipant && isAdminParticipant(botParticipant)),
        time: Date.now()
    }
}

/**
 * Retorna os dados do grupo com cache de TTL curto
 * @param {string} groupJid
 * @param {object} [opts]
 * @param {boolean} [opts.refresh] - Força uma nova busca (ignora cache)
 * @returns {Promise<object>}
 */
async function getGroupData(groupJid, { refresh = false } = {}) {
    if (!groupJid) throw new Error('groupJid é obrigatório')

    const cached = cache.get(groupJid)
    if (!refresh && cached && Date.now() - cached.time < TTL_MS) {
        return cached
    }

    const fresh = await fetchGroupData(groupJid)
    cache.set(groupJid, fresh)
    return fresh
}

/**
 * Invalida o cache de um grupo (chamado em groups.update / groups.participants.update)
 * @param {string} groupJid
 */
function invalidate(groupJid) {
    if (groupJid) cache.delete(groupJid)
}

/**
 * Invalida todo o cache (relançamento da conexão)
 */
function invalidateAll() {
    cache.clear()
}

/**
 * Verifica se um usuário é administrador do grupo (busca fresca)
 * @param {string} groupJid
 * @param {string} userJid
 * @returns {Promise<boolean>}
 */
async function isGroupAdmin(groupJid, userJid) {
    if (!groupJid || !userJid) return false
    const gd = await getGroupData(groupJid)
    return gd.admins.has(normalizeJid(userJid))
}

/**
 * Verifica se o BOT é administrador do grupo
 * @param {string} groupJid
 * @param {object} [opts]
 * @param {boolean} [opts.refresh]
 * @returns {Promise<boolean>}
 */
async function isBotAdmin(groupJid, { refresh = false } = {}) {
    if (!groupJid) return false
    const gd = await getGroupData(groupJid, { refresh })
    return gd.isBotAdmin
}

/**
 * Lista os JIDs dos administradores do grupo
 * @param {string} groupJid
 * @returns {Promise<string[]>}
 */
async function getAdmins(groupJid) {
    if (!groupJid) return []
    const gd = await getGroupData(groupJid)
    return Array.from(gd.admins)
}

module.exports = {
    attach,
    getClient,
    normalizeJid,
    sameUser,
    getBotJids,
    isBotJid,
    getParticipantJid,
    resolveRealJid,
    resolveMemberJid,
    getGroupData,
    invalidate,
    invalidateAll,
    isGroupAdmin,
    isBotAdmin,
    getAdmins,
    TTL_MS
}