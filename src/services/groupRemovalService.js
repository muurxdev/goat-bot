/**
 * Group Removal Service
 * Fonte única de "tirar alguém do grupo": .ban, .kick, .timeban, .warn,
 * votações e a moderação automática passam por aqui.
 *
 * Regras:
 *  - Admin PODE ser removido. O único intocável é quem criou o grupo
 *    (participante 'superadmin' / metadata.owner) — além do próprio bot.
 *  - O resultado vem do WhatsApp, não de suposição. groupParticipantsUpdate do
 *    Baileys NÃO lança quando o WhatsApp recusa: devolve um status por
 *    participante ('200', '403', '404'...). Antes ninguém lia esse status e o
 *    bot anunciava "membro removido" com a pessoa ainda no grupo.
 *  - Toda falha tem um motivo e uma mensagem própria para o grupo.
 */

const logger = require('../core/logger')
const groupAuthService = require('./groupAuthService')
const dataService = require('./dataService')

const MOTIVOS = Object.freeze({
    BOT_SEM_ADMIN: 'botSemAdmin',
    E_O_BOT: 'eOBot',
    NAO_ESTA: 'naoEsta',
    CRIADOR: 'criador',
    PROPRIO: 'proprio',
    LIMITE: 'limite',
    RECUSADO: 'recusado',
    SEM_ALVO: 'semAlvo'
})

function tag(jid) {
    return '@' + String(jid || '').split('@')[0].split(':')[0]
}

/**
 * Alvo de um comando: menção > mensagem respondida > número digitado.
 * @returns {string|null}
 */
function extrairAlvo({ info, args = [], quotedSender, mentioned } = {}) {
    const ctxInfo = info?.message?.extendedTextMessage?.contextInfo
    const mencao = mentioned || ctxInfo?.mentionedJid?.[0]
    if (mencao) return mencao
    const respondido = quotedSender || ctxInfo?.participant
    if (respondido) return respondido
    const digitos = String(args[0] || '').replace(/\D/g, '')
    return digitos.length >= 8 ? `${digitos}@s.whatsapp.net` : null
}

/**
 * Diz se o JID é quem criou o grupo. O WhatsApp marca o criador como
 * 'superadmin'; metadata.owner/ownerPn cobrem o caso de o participante vir sem
 * a marca (formato LID vs número).
 */
function ehCriador(groupData, jid) {
    if (!groupData || !jid) return false
    const participante = (groupData.participants || []).find(p => groupAuthService.sameUser(p.id, jid))
    if (participante?.admin === 'superadmin') return true
    const meta = groupData.data || {}
    return [meta.owner, meta.ownerPn].some(o => o && groupAuthService.sameUser(o, jid))
}

/**
 * Checa se o alvo pode ser removido, sem remover. Usado antes de abrir votação
 * e dentro de removerMembro.
 * @returns {Promise<{ ok: boolean, motivo?: string, apiJid: string, groupData?: object }>}
 */
async function avaliarAlvo(client, groupJid, rawAlvo, { autor } = {}) {
    if (!rawAlvo) return { ok: false, motivo: MOTIVOS.SEM_ALVO, apiJid: '' }

    const groupData = await groupAuthService.getGroupData(groupJid, { refresh: true })
    const apiJid = await groupAuthService.resolveMemberJid(client, rawAlvo, groupData) || groupAuthService.normalizeJid(rawAlvo)
    const base = { apiJid, groupData }

    if (groupAuthService.isBotJid(apiJid, client) || groupAuthService.isBotJid(rawAlvo, client)) {
        return { ...base, ok: false, motivo: MOTIVOS.E_O_BOT }
    }
    if (autor && [apiJid, rawAlvo].some(j => groupAuthService.sameUser(j, autor))) {
        return { ...base, ok: false, motivo: MOTIVOS.PROPRIO }
    }

    const participante = groupData.participants.find(p =>
        groupAuthService.sameUser(p.id, apiJid) || groupAuthService.sameUser(p.id, rawAlvo))
    if (!participante) return { ...base, ok: false, motivo: MOTIVOS.NAO_ESTA }

    if (ehCriador(groupData, participante.id)) return { ...base, ok: false, motivo: MOTIVOS.CRIADOR }
    if (!groupData.isBotAdmin) return { ...base, ok: false, motivo: MOTIVOS.BOT_SEM_ADMIN }

    return { ...base, ok: true, apiJid: groupAuthService.normalizeJid(participante.id) }
}

function ehLimiteDeTaxa(err) {
    const code = err?.output?.statusCode || err?.data?.statusCode || err?.statusCode
    return code === 429 || /rate.?over.?limit|too many/i.test(String(err?.message || ''))
}

/**
 * Remove um participante e confirma com o WhatsApp.
 * @param {object} client - Socket Baileys
 * @param {string} groupJid
 * @param {string} rawAlvo - JID do alvo (número, LID ou com sufixo)
 * @param {object} [opts]
 * @param {string} [opts.autor] - quem pediu (impede remover a si mesmo)
 * @param {string} [opts.origem] - rótulo para o log ('ban', 'antilink'...)
 * @returns {Promise<{ ok: boolean, motivo?: string, apiJid: string, status?: string }>}
 */
async function removerMembro(client, groupJid, rawAlvo, { autor, origem = 'remocao' } = {}) {
    let avaliacao
    try {
        avaliacao = await avaliarAlvo(client, groupJid, rawAlvo, { autor })
    } catch (err) {
        logger.error(`[REMOCAO:${origem}] Falha ao ler o grupo ${groupJid} para remover ${rawAlvo}:`, err)
        return { ok: false, motivo: MOTIVOS.RECUSADO, apiJid: rawAlvo || '' }
    }
    if (!avaliacao.ok) {
        logger.info(`[REMOCAO:${origem}] ${rawAlvo} não removido de ${groupJid}: ${avaliacao.motivo}`)
        return { ok: false, motivo: avaliacao.motivo, apiJid: avaliacao.apiJid }
    }

    const { apiJid } = avaliacao
    let resultado
    try {
        resultado = await client.groupParticipantsUpdate(groupJid, [apiJid], 'remove')
    } catch (err) {
        const motivo = ehLimiteDeTaxa(err) ? MOTIVOS.LIMITE : MOTIVOS.RECUSADO
        logger.warn(`[REMOCAO:${origem}] WhatsApp recusou remover ${apiJid} de ${groupJid} (${motivo}): ${err.message}`)
        return { ok: false, motivo, apiJid }
    } finally {
        groupAuthService.invalidate(groupJid)
    }

    const lista = Array.isArray(resultado) ? resultado : []
    const item = lista.find(r => groupAuthService.sameUser(r?.jid, apiJid)) || lista[0]
    const status = String(item?.status ?? '200')

    if (status === '200') {
        logger.info(`[REMOCAO:${origem}] ${apiJid} removido de ${groupJid}${autor ? ` por ${autor}` : ''}`)
        return { ok: true, apiJid, status }
    }

    const motivo = status === '404' ? MOTIVOS.NAO_ESTA : status === '429' ? MOTIVOS.LIMITE : MOTIVOS.RECUSADO
    logger.warn(`[REMOCAO:${origem}] WhatsApp devolveu status ${status} ao remover ${apiJid} de ${groupJid}`)
    return { ok: false, motivo, apiJid, status }
}

/**
 * Mensagem para o grupo quando a remoção não aconteceu.
 */
function mensagemFalha(motivo, alvo) {
    const t = tag(alvo)
    switch (motivo) {
        case MOTIVOS.SEM_ALVO:
            return '❓ Marque, responda ou digite o número de quem devo remover.'
        case MOTIVOS.BOT_SEM_ADMIN:
            return '⚠️ Preciso ser administrador do grupo para remover alguém. Me promova a admin e tente de novo.'
        case MOTIVOS.E_O_BOT:
            return '🙂 Não posso remover a mim mesmo. Se quiser que eu saia, me remova pelo próprio WhatsApp.'
        case MOTIVOS.PROPRIO:
            return '⚠️ Você não pode remover a si mesmo do grupo.'
        case MOTIVOS.NAO_ESTA:
            return `🔍 ${t} não está neste grupo.`
        case MOTIVOS.CRIADOR:
            return `👑 ${t} criou este grupo, então não pode ser removido — nem pela administração, nem por mim.`
        case MOTIVOS.LIMITE:
            return `⏳ O WhatsApp pediu uma pausa: foram muitas remoções em pouco tempo, e ${t} continua no grupo. Tente de novo em alguns minutos.`
        case MOTIVOS.RECUSADO:
        default:
            return `⚠️ O WhatsApp não me deixou remover ${t}, então nada mudou.\n\n` +
                'Isso costuma acontecer quando a pessoa é dona da comunidade do grupo ou quando houve muitas remoções seguidas. Tente de novo em alguns minutos.'
    }
}

// ══════════════════════════════════════════════════════════════
// BANIMENTO TEMPORÁRIO
// ══════════════════════════════════════════════════════════════

/**
 * Registra um banimento temporário. Enquanto valer, quem voltar ao grupo é
 * removido de novo (ver aplicarBanTemporario).
 */
async function registrarBanTemporario(groupJid, { jid, apiJid, durationMs, bannedBy }) {
    const configs = dataService.getConfigsData()
    if (!configs[groupJid]) configs[groupJid] = {}
    const agora = Date.now()
    const ativos = (configs[groupJid].tempBans || []).filter(b => b.expiresAt > agora &&
        !groupAuthService.sameUser(b.jid, jid) && !groupAuthService.sameUser(b.apiJid, apiJid))
    ativos.push({ jid, apiJid, expiresAt: agora + durationMs, bannedBy, bannedAt: agora })
    configs[groupJid].tempBans = ativos
    await dataService.saveConfigsData(configs)
}

/**
 * Procura um banimento temporário ativo para quem acabou de entrar. Também
 * descarta os vencidos. Aceita os vários formatos que o evento traz (LID,
 * número, objeto com phoneNumber).
 * @returns {Promise<object|null>} o registro do ban, se ainda valer
 */
async function buscarBanTemporario(client, groupJid, participante) {
    const configs = dataService.getConfigsData()
    const lista = configs[groupJid]?.tempBans
    if (!Array.isArray(lista) || lista.length === 0) return null

    const agora = Date.now()
    const ativos = lista.filter(b => b && b.expiresAt > agora)
    if (ativos.length !== lista.length) {
        configs[groupJid].tempBans = ativos
        await dataService.saveConfigsData(configs)
    }
    if (ativos.length === 0) return null

    const id = typeof participante === 'string' ? participante : (participante?.id || participante?.jid || '')
    const candidatos = new Set([id, participante?.phoneNumber].filter(Boolean))
    if (id) candidatos.add(await groupAuthService.resolveRealJid(client, id))

    return ativos.find(b => [...candidatos].some(c =>
        groupAuthService.sameUser(c, b.jid) || groupAuthService.sameUser(c, b.apiJid))) || null
}

module.exports = {
    MOTIVOS,
    extrairAlvo,
    ehCriador,
    avaliarAlvo,
    removerMembro,
    mensagemFalha,
    registrarBanTemporario,
    buscarBanTemporario
}
