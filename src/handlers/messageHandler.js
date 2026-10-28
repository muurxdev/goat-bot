/**
 * Message Handler
 * Processa mensagens recebidas do Baileys e delega para o Command Dispatcher
 */

const { dispatch, findCommand } = require('./commandDispatcher')
const env = require('../config/env')
const dataService = require('../services/dataService')
const groupAuthService = require('../services/groupAuthService')
const { initializeUser, processarLevelUp, aplicarBonusRebirthXp, adicionarXp } = require('../services/xpService')
const { getCargo } = require('../utils/helpers')
const { formatCoins } = require('../utils/uiEngine')
const { getDatabase } = require('../database/connection')
const userRepo = require('../database/repositories/userRepository')
const { detectTravaZap, checkGroupSpam } = require('../services/securityService')
const ownerService = require('../services/ownerService')
const groupProtectionService = require('../services/groupProtectionService')
const logger = require('../core/logger')

const { containsLink, detectLinkPlatform } = require('../utils/linkDetector')

// Cache anti-spam de XP por mensagem: evita que mensagens consecutivas ou flood
// aumentem dezenas de levels ou causem saltos anômalos. Cooldown de 30s por usuário.
/**
 * Anuncia a subida de nível com cartão em imagem e legenda completa.
 * Se o cartão falhar, manda só o texto.
 */
async function anunciarSubidaDeNivel({ client, from, info, sender, user, lvlRes }) {
    const { getXpProgress, getCargo } = require('../services/xpService')
    const F = require('../utils/formato')
    const prog = getXpProgress(user)
    const antes = user.level - (lvlRes.levelsGanhos || 1)

    // Nome real do usuário (prioriza o pushName real do WhatsApp sobre nicks genéricos)
    const realPushName = info?.pushName || info?.message?.extendedTextMessage?.contextInfo?.pushName
    const nomeReal = realPushName || user.name || user.displayNick || user.nicknameRpg || sender.split('@')[0]

    // Nome real do grupo para contextualizar o cartão com o tema do ambiente
    let grupoNome = 'Grupo Oficial'
    if (from && from.endsWith('@g.us')) {
        try {
            grupoNome = await groupAuthService.getGroupSubject(from, client) || 'Grupo Oficial'
        } catch (err) { logger.warn('[MESSAGEHANDLER] falha ignorada: ' + (err && err.message)) }
    }

    const legenda = F.tela({
        emoji: '🎉',
        titulo: `Subiu para o nível ${user.level}`,
        intro: `@${sender.split('@')[0]} (*${nomeReal}*) agora é *${getCargo(user.level)}*.`,
        secoes: [
            { emoji: '🎁', titulo: 'Ganhos', linhas: [
                F.campo('Vida máxima', `${Number(user.hpMax || 0).toLocaleString('pt-BR')} (+${lvlRes.ganhoHp})`),
                F.campo('Bônus', `+${formatCoins(lvlRes.ganhoCoins)}`),
                F.campo('Poder', prog.poder)
            ] },
            { emoji: '📈', titulo: `Rumo ao nível ${user.level + 1}`, linhas: [
                `${prog.barra} ${prog.percent}%`,
                `Faltam ${prog.faltam.toLocaleString('pt-BR')} XP`
            ] }
        ],
        proximos: [{ nome: 'perfil', oque: 'ver seu perfil' }]
    })
    let imagem = null
    try {
        const cartao = require('../services/cartaoService')
        imagem = await cartao.cartaoNivel({
            nome: nomeReal,
            grupo: grupoNome,
            nivelAntes: Math.max(1, antes),
            nivelDepois: user.level,
            ganhos: [
                ['Vida Máxima', `+${lvlRes.ganhoHp} HP`],
                ['Moedas', `+${Number(lvlRes.ganhoCoins || 0).toLocaleString('pt-BR')}`],
                ['Patente', getCargo(user.level)]
            ],
            fracaoProximo: (prog.percent || 0) / 100,
            xpFaltam: prog.faltam,
            foto: await cartao.fotoDePerfil(client, sender)
        })
    } catch (err) {
        logger.warn(`[LEVEL UP] Cartão não saiu, mando só o texto: ${err.message}`)
    }
    const conteudo = imagem ? { image: imagem, caption: legenda, mentions: [sender] } : { text: legenda, mentions: [sender] }
    await client.sendMessage(from, conteudo, { quoted: info })
}

const _msgXpCooldown = new Map()
const MSG_XP_COOLDOWN_MS = 30000

/**
 * Invalida o cache de metadata de um grupo (usado nos eventos groups.update /
 * groups.participants.update para reconhecer imediatamente promoção/rebaixamento do bot).
 * Delega para o GroupAuthService (fonte única de cache).
 * @param {string} groupJid
 */
function invalidateGroupCache(groupJid) {
    groupAuthService.invalidate(groupJid)
}

// Cache de desduplicação para evitar reprocessamento em rajadas de retentativas do WhatsApp/Baileys
const _processedMsgIds = new Map()
const DEDUP_TTL_MS = 5 * 60 * 1000

function isDuplicateMessage(msgId) {
    if (!msgId || process.env.NODE_ENV === 'test') return false
    const now = Date.now()
    if (_processedMsgIds.size > 2000) {
        for (const [id, time] of _processedMsgIds.entries()) {
            if (now - time > DEDUP_TTL_MS) _processedMsgIds.delete(id)
        }
    }
    if (_processedMsgIds.has(msgId)) return true
    _processedMsgIds.set(msgId, now)
    return false
}

// Cache circular anti-delete para recuperação de mensagens apagadas
const _recentMessages = new Map()
const MAX_RECENT_MSGS = 500

function recordRecentMessage(msgId, data) {
    if (!msgId) return
    if (_recentMessages.size >= MAX_RECENT_MSGS) {
        const firstKey = _recentMessages.keys().next().value
        _recentMessages.delete(firstKey)
    }
    _recentMessages.set(msgId, data)
}

/**
 * Manipula mensagens recebidas do evento messages.upsert
 * @param {object} client - Instância do socket Baileys
 * @param {object} upsertData - Dados do evento messages.upsert
 */
async function handleIncomingMessage(client, { messages }) {
    if (!messages || messages.length === 0) return

    const info = messages[0]
    if (!info.message) return
    if (info.key && info.key.fromMe) return

    // Desduplica mensagens repetidas pelo Baileys/WhatsApp
    if (info.key?.id && isDuplicateMessage(info.key.id)) {
        logger.debug(`[DEDUP] Mensagem repetida ignorada: ${info.key.id}`)
        return
    }

    const from = info.key.remoteJid
    if (!from) return

    // ═══════════════════════════════════════════════════════════════
    // 📢 DETECÇÃO DE MARCAÇÃO DE STATUS (STATUS MENTION PROTECTION)
    // ═══════════════════════════════════════════════════════════════
    if (from === 'status@broadcast') {
        try {
            const participant = info.key?.participant || info.participant;
            if (participant) {
                const contextInfo = info.message?.extendedTextMessage?.contextInfo ||
                    info.message?.imageMessage?.contextInfo ||
                    info.message?.videoMessage?.contextInfo;
                const mentionedJids = contextInfo?.mentionedJid || [];

                const configs = mentionedJids.length ? dataService.getConfigsData() : {};
                for (const targetJid of mentionedJids) {
                    if (targetJid && targetJid.endsWith('@g.us')) {
                        // Só pune com o .antistatus ligado no grupo marcado.
                        if (!configs[targetJid]?.antistatus) {
                            logger.debug(`[STATUS MENTION] ${participant} marcou ${targetJid} no status; .antistatus desligado lá.`);
                            continue;
                        }
                        const warnLimit = configs[targetJid]?.warnLimit || 3;
                        const warns = dataService.getWarnsData();
                        warns[participant] = (warns[participant] || 0) + 1;
                        const total = warns[participant];
                        await dataService.saveWarnsData(warns);

                        logger.warn(`[STATUS MENTION DETECTED] ${participant} mencionou grupo ${targetJid} nos status. (${total}/${warnLimit})`);

                        const authorNum = participant.split('@')[0].split(':')[0];
                        let alert = `📢 @${authorNum}, não é permitido marcar este grupo no status. Advertência *${total} de ${warnLimit}*.`;

                        if (total >= warnLimit) {
                            const { removerMembro, mensagemFalha } = require('../services/groupRemovalService');
                            const resultado = await removerMembro(client, targetJid, participant, { origem: 'status' });
                            if (resultado.ok) {
                                warns[participant] = 0;
                                await dataService.saveWarnsData(warns);
                                alert += `\n\n@${authorNum} chegou a ${warnLimit} advertências e foi removido do grupo.`;
                            } else {
                                alert += `\n\n@${authorNum} chegou a ${warnLimit} advertências.\n\n${mensagemFalha(resultado.motivo, participant)}`;
                            }
                        }

                        await client.sendMessage(targetJid, { text: alert, mentions: [participant] })
                            .catch(e => logger.warn(`[STATUS MENTION] Falha ao avisar ${targetJid} sobre ${participant}: ${e.message}`));
                    }
                }
            }
        } catch (statusErr) {
            logger.warn(`[STATUS PROCESS ERROR] Falha ao tratar status de ${info.key?.participant || '?'}: ${statusErr.message}`);
        }
        return;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🗑️ ANTI-DELETE (DETECÇÃO DE MENSAGENS REVOGADAS/APAGADAS)
    // ═══════════════════════════════════════════════════════════════
    const protoMsg = info.message?.protocolMessage
    if (protoMsg && (protoMsg.type === 0 || protoMsg.type === 'REVOKE' || String(protoMsg.type) === '0')) {
        const targetChat = protoMsg.key?.remoteJid || from
        if (targetChat && targetChat.endsWith('@g.us')) {
            const configs = dataService.getConfigsData()
            if (configs[targetChat]?.antidelete) {
                const targetId = protoMsg.key?.id
                const cached = targetId ? _recentMessages.get(targetId) : null
                const author = protoMsg.key?.participant || cached?.sender || info.key?.participant || 'Alguém'
                const authorNum = author.split('@')[0].split(':')[0]

                let alert = `╔══════════════════════════════╗\n`
                alert += `║     🗑️ *ANTI-DELETE ATIVO* 🛡️    ║\n`
                alert += `╚══════════════════════════════╝\n\n`
                alert += `👤 *Usuário:* @${authorNum}\n`
                if (cached && cached.text) {
                    alert += `💬 *Mensagem Apagada:*\n"${cached.text}"\n\n`
                } else {
                    alert += `⚠️ *Aviso:* Este usuário apagou uma mensagem recentemente.\n\n`
                }
                alert += `👑 *GOAT Prime*`

                try {
                    await client.sendMessage(targetChat, { text: alert, mentions: [author] })
                } catch (delErr) {
                    logger.warn(`[ANTI-DELETE] Falha ao notificar em ${targetChat}: ${delErr.message}`)
                }
            }
        }
        return
    }

    // Marcar como lida
    try {
        await client.readMessages([{
            remoteJid: from,
            id: info.key.id,
            participant: info.key.participant
        }])
    } catch (e) {
        logger.warn(`[READ RECEIPT] Falha ao marcar como lida a mensagem ${info.key.id} de ${from}: ${e.message}`)
    }

    // Extração do tipo e corpo da mensagem.
    //
    // O WhatsApp ENVELOPA a mensagem real em várias situações — a mais comum
    // sendo `ephemeralMessage`, das mensagens temporárias. Antes o corpo só era
    // lido de 4 tipos crus, então num grupo com mensagens temporárias ligadas
    // TODA mensagem chegava com corpo vazio: o bot recebia, não reconhecia
    // comando nenhum e ficava mudo, sem erro em lugar algum.
    const ENVELOPES = [
        'ephemeralMessage',
        'viewOnceMessage',
        'viewOnceMessageV2',
        'viewOnceMessageV2Extension',
        'documentWithCaptionMessage',
        'editedMessage'
    ]

    /** Abre os envelopes até chegar no conteúdo de verdade. */
    function desembrulhar(msg, profundidade = 0) {
        if (!msg || profundidade > 4) return msg
        for (const env of ENVELOPES) {
            if (msg[env]?.message) return desembrulhar(msg[env].message, profundidade + 1)
        }
        // Mensagem editada chega dentro de um protocolMessage.
        if (msg.protocolMessage?.editedMessage) {
            return desembrulhar(msg.protocolMessage.editedMessage, profundidade + 1)
        }
        return msg
    }

    const conteudo = desembrulhar(info.message) || info.message

    const chaves = Object.keys(conteudo).filter(k => k !== 'messageContextInfo' && k !== 'senderKeyDistributionMessage')
    const type = chaves[0] || Object.keys(conteudo)[0]

    /** Texto de qualquer tipo que carregue texto ou legenda. */
    function extrairTexto(m) {
        if (!m) return ''
        return m.conversation
            || m.extendedTextMessage?.text
            || m.imageMessage?.caption
            || m.videoMessage?.caption
            || m.documentMessage?.caption
            || m.audioMessage?.caption
            || m.buttonsResponseMessage?.selectedButtonId
            || m.templateButtonReplyMessage?.selectedId
            || m.listResponseMessage?.singleSelectReply?.selectedRowId
            || m.listResponseMessage?.title
            || m.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
            || ''
    }

    let body = extrairTexto(conteudo)
    // Rede de segurança: se o desembrulho não achou nada, tenta o objeto cru.
    if (!body) body = extrairTexto(info.message)
    body = String(body || '')

    const isGroup = from.endsWith('@g.us')
    const sender = isGroup ? (info.key.participant || from) : from

    // Registra no cache de mensagens recentes para o Anti-Delete
    if (isGroup && info.key?.id && body) {
        recordRecentMessage(info.key.id, {
            id: info.key.id,
            text: body,
            sender,
            from,
            timestamp: Date.now(),
            type
        })
    }

    // Identificação de papéis e permissões
    let isAdmin = false
    let isBotAdmin = false
    const senderReal = await groupAuthService.resolveRealJid(client, sender)
    const isOwner = env.isOwnerJid(sender) || env.isOwnerJid(senderReal) || ownerService.isOwner(sender, [senderReal])

    // Inicialização do perfil do usuário e ganho ativo de XP.
    // xpData começa vazio: initializeUser carrega SÓ o remetente (getUser pontual)
    // e o grava aqui, então os saveXpData abaixo persistem apenas 1 linha — em vez
    // de varrer/reescrever os 352 usuários a cada mensagem recebida.
    const candidateJids = [sender, senderReal].filter(Boolean)
    const xpData = {}
    const configs = dataService.getConfigsData()
    const allowPvXp = configs['global']?.allowPvXpFarm === true
    const user = initializeUser(sender, xpData, candidateJids)

    // Telemetria real de dispositivo e rede.
    // Fonte canônica: getDevice() do Baileys deriva a plataforma (web/desktop/
    // android/ios) do formato do ID da mensagem — bem mais preciso que a heurística
    // antiga. Persistimos lastDevice + lastPlatform p/ o .dossie de terceiros.
    // Prioridade: modelo definido pelo usuário (.setdevice) > detectado pelo Baileys.
    const keyId = info?.key?.id || ''
    const { deviceFromKeyId } = require('../services/telemetryDeviceService')
    const _dev = deviceFromKeyId(keyId)
    if (user.dispositivoModelo && user.dispositivoModelo.trim().length > 2) {
        user.lastDevice = user.dispositivoModelo.trim()
        user.lastPlatform = _dev ? _dev.platform : (user.lastPlatform || 'Indeterminado')
    } else if (_dev) {
        user.lastDevice = _dev.model
        user.lastPlatform = _dev.platform
    } else if (!user.lastDevice) {
        user.lastDevice = '📱 Dispositivo (indeterminado)'
        user.lastPlatform = user.lastPlatform || 'Indeterminado'
    }

    if (info?.pushName && (!user.name || user.name !== info.pushName)) {
        user.name = info.pushName
    }

    const msgTimestamp = info?.messageTimestamp ? (Number(info.messageTimestamp) * 1000) : Date.now()
    const diff = Math.abs(Date.now() - msgTimestamp)
    // Atraso de entrega REAL (carimbo do aparelho -> processamento do bot).
    // Antes, fora da faixa 'bonita' o valor era trocado por Math.random().
    user.lastPingMs = (diff >= 0 && diff < 120000) ? diff : null
    // O WhatsApp não expõe o tipo de conexão de ninguém. O rótulo antigo
    // ("Fibra Óptica / Wi-Fi 7") era deduzido do atraso e portanto inventado.
    // Agora classificamos apenas o que é medido: a rapidez da ENTREGA.
    if (user.lastPingMs === null) user.netType = '❔ Não medido'
    else if (user.lastPingMs < 800) user.netType = '⚡ Entrega instantânea'
    else if (user.lastPingMs < 3000) user.netType = '📶 Entrega rápida'
    else if (user.lastPingMs < 15000) user.netType = '📡 Entrega com atraso'
    else user.netType = '🐢 Entrega lenta (rede instável)'

    user.lastSeen = Date.now()
    if (senderReal) user.phone = senderReal.split('@')[0]
    if (sender.endsWith('@lid')) user.lid = sender

    // Persiste o vínculo de identidade (lid ↔ número) p/ unificação durável do perfil.
    if (senderReal && senderReal !== sender) {
        const phoneDigits = senderReal.replace(/[@].*$/, '').replace(/\D/g, '') || null
        userRepo.linkIdentity(user.jid || sender, {
            lid: sender.endsWith('@lid') ? sender : (user.lid || null),
            phoneDigits,
            linkedJid: senderReal
        })
    }

    user.messages = (user.messages || 0) + 1
    if (isGroup) {
        user.messagesGroup = (user.messagesGroup || 0) + 1
    } else {
        user.messagesPv = (user.messagesPv || 0) + 1
    }

    // Ganho de XP liberado em grupos OU no PV quando ativado pelo dono (.farmpv on).
    // Gate da camada opt-in: o módulo "xp" (progressão passiva) precisa estar ligado.
    const _ms = require('../services/moduleStateService')
    const xpModuleOn = _ms.isModuleEnabled('xp', _ms.scopeOf(from, isGroup))
    const groupXpAllowed = isGroup ? (configs[from]?.xpEnabled !== false) : true
    if ((isGroup || allowPvXp) && xpModuleOn && groupXpAllowed) {
        const now = Date.now()
        const lastXpTime = _msgXpCooldown.get(sender) || 0
        if (now >= lastXpTime) {
            _msgXpCooldown.set(sender, now + MSG_XP_COOLDOWN_MS)

            // XP passivo consistente por mensagem (5 a 10 XP) com leve bônus por mídia
            const base = Math.floor(Math.random() * 6) + 5 // 5 a 10
            const typeBonus = {
                audioMessage: 3, videoMessage: 3, imageMessage: 2,
                stickerMessage: 1, documentMessage: 2
            }[type] || 0
            const rawXp = base + typeBonus

            // Adiciona XP com origem segmentada e limite estrito: no chat comum sobe NO MÁXIMO 1 level por mensagem
            const { xpGanho, lvlRes } = adicionarXp(user, rawXp, {
                source: isGroup ? 'group' : 'pv',
                maxLevels: 1
            })

            // Avalia subida de nível em tempo real. Sem await: o cartão e a foto de
            // perfil levam até alguns segundos e não podem atrasar a mensagem.
            if (lvlRes.subiu && (isGroup ? configs[from]?.notifyLevelUp !== false : true)) {
                anunciarSubidaDeNivel({ client, from, info, sender, user, lvlRes })
                    .catch(e => logger.warn(`[LEVEL UP] Falha ao anunciar subida de nivel de ${sender}: ${e.message}`))
            }
        }
    }

    // Salva perfil atualizado no banco SQLite — SOMENTE para quem já fez `.login`
    // (ou para o Dono). Sem isso, cada pessoa que só passa pelo grupo criava uma
    // linha vazia no banco, poluindo rankings e listas com quem nunca jogou.
    // Depois do login, tudo passa a salvar naturalmente (PV, grupo e RPG).
    if (user.registered) {
        dataService.saveUser(user)
    }

    // ═══════════════════════════════════════
    // 🎁 SISTEMA DE DROP PATROCINADO / DOAÇÃO
    // ═══════════════════════════════════════
    if (isGroup) {
        const configs = dataService.getConfigsData();
        const pendingDrop = configs[from]?.pendingDrop;
        if (pendingDrop && pendingDrop.amount > 0 && pendingDrop.sponsor !== sender) {
            const dropAge = Date.now() - (pendingDrop.createdAt || 0);
            const MAX_DROP_AGE = 60 * 60 * 1000; // 1h
            if (dropAge < MAX_DROP_AGE) {
                user.coins = (user.coins || 0) + pendingDrop.amount;
                const dropAmount = pendingDrop.amount;
                const dropSponsor = pendingDrop.sponsor;
                configs[from].pendingDrop = null;
                await dataService.saveConfigsData(configs);
                await dataService.saveXpData({ [sender]: user });
                await client.sendMessage(from, {
                    text: `🎁 @${sender.split('@')[0]} pegou o drop de *${formatCoins(dropAmount)}* oferecido por @${dropSponsor.split('@')[0]}!`,
                    mentions: [sender, dropSponsor]
                });
            } else {
                // Drop expirado — devolver coins ao patrocinador
                // Leitura pontual: getXpData() carregava a tabela inteira aqui.
                const sponsorData = dataService.getUser(pendingDrop.sponsor);
                if (sponsorData) {
                    sponsorData.coins = (sponsorData.coins || 0) + pendingDrop.amount;
                    await dataService.saveXpData({ [pendingDrop.sponsor]: sponsorData });
                }
                configs[from].pendingDrop = null;
                await dataService.saveConfigsData(configs);
                await client.sendMessage(from, {
                    text: `⏰ Ninguém pegou o drop de *${formatCoins(pendingDrop.amount)}* a tempo, então as moedas voltaram para quem ofereceu.`
                });
            }
        }
    }

    if (isGroup) {
        // Autenticação de admin do grupo via GroupAuthService
        try {
            isAdmin = await groupAuthService.isGroupAdmin(from, sender)
        } catch (e) {
            logger.warn(`[GROUP AUTH WARN] Falha ao validar admin de ${from}:`, e.message)
        }
        try {
            isBotAdmin = await groupAuthService.isBotAdmin(from)
        } catch (e) {
            logger.warn(`[GROUP AUTH WARN] Falha ao validar bot-admin em ${from}:`, e.message)
        }

        // Auto-Upagem de Dono: Se o remetente for Dono do bot e o bot for admin, promove o dono automaticamente
        if (isOwner && isBotAdmin && !isAdmin) {
            try {
                const groupData = await groupAuthService.getGroupData(from)
                const apiJid = await groupAuthService.resolveMemberJid(client, sender, groupData) || sender
                await client.groupParticipantsUpdate(from, [apiJid], 'promote')
                groupAuthService.invalidate(from)
                isAdmin = true
                logger.info(`[AUTO PROMOTE OWNER] Dono ${sender} promovido automaticamente a admin em ${from}`)
            } catch (autoErr) {
                logger.warn(`[AUTO PROMOTE WARN] Falha ao promover Dono em ${from}:`, autoErr.message)
            }
        }

        // Log de diagnóstico estruturado de permissão no grupo
        logger.debug(`[GROUP_PERMISSION_CHECK] group=${from} sender=${groupAuthService.normalizeJid(sender)}(` +
            `real=${groupAuthService.normalizeJid(senderReal)}) ` +
            `botJids=[${Array.from(groupAuthService.getBotJids(client)).join(',')}] ` +
            `senderGroupAdmin=${isAdmin} botGroupAdmin=${isBotAdmin} owner=${isOwner}`)

        // ═══════════════════════════════════════
        // 🔇 VERIFICAÇÃO DE SILENCIAMENTO (MUTE)
        // ═══════════════════════════════════════
        const muteService = require('../services/muteService');
        const muteCheck = muteService.isMuted(from, sender);
        if (muteCheck.muted && !isOwner) {
            if (isBotAdmin && info?.key) {
                await client.sendMessage(from, { delete: info.key })
                    .catch(e => logger.warn(`[MUTE] Falha ao apagar mensagem de ${sender} em ${from}: ${e.message}`));
            }
            if (muteService.shouldNotifyMuted(from, sender)) {
                const senderNum = sender.split('@')[0].split(':')[0];
                const prazo = Number.isFinite(muteCheck.remainingMs)
                    ? `por mais ${muteCheck.remainingText}`
                    : 'até a administração liberar';
                let alertMsg = `🔇 @${senderNum}, você está silenciado aqui ${prazo}.`;
                if (isBotAdmin) alertMsg += ` Suas mensagens serão apagadas até lá.`;
                if (muteCheck.reason) alertMsg += `\n\n*Motivo:* ${muteCheck.reason}`;
                await client.sendMessage(from, { text: alertMsg, mentions: [sender] }).catch(() => {});
            }
            return;
        }

        // ═══════════════════════════════════════
        // 🔗 SISTEMA DE LINKS, AFILIADOS & ANTI-LINK
        // ═══════════════════════════════════════
        const configs = dataService.getConfigsData();
        const isStrict = Boolean(configs[from]?.strictModeration);
        const isSubjectToRules = !isOwner && (!isAdmin || isStrict);

        // Aprendizado de Máquina contínuo: estuda o estilo do usuário (código, gírias, toxicidade)
        const aiLearning = require('../services/aiLearningService');
        aiLearning.learnFromMessage(sender, body, from, isGroup);

        // Proteções ligadas por comando (.antispamlink, .profanity, .capslock,
        // .flood, .slowmode, .antistatus). A regra está no serviço.
        try {
            const barrada = await groupProtectionService.processarMensagem(client, {
                grupo: from, pessoa: sender, texto: body, tipo: type, info,
                cfg: configs[from], isAdmin, isOwner, isBotAdmin
            });
            if (barrada) return;
        } catch (protErr) {
            logger.error(`[PROTECAO] Falha ao aplicar proteções à mensagem de ${sender} em ${from}:`, protErr);
        }

        const hasLink = containsLink(body);

        if (hasLink && isSubjectToRules) {
            // ── FISCALIZAÇÃO FLUENTE DE LINKS E PARCERIAS ─────────────────────
            // Parceiros/afiliados autorizados NÃO possuem limite diário nem exclusão de mensagens.
            // Membros sem parceria sofrem banimento imediato se o anti-link estiver ligado.
            const aiLearning = require('../services/aiLearningService');
            const isUserAllowed = aiLearning.isUserAllowedToPostLinks(from, sender, configs);

            if (isUserAllowed) {
                // Usuário é parceiro/afiliado oficial: postagem 100% liberada sem restrições nem cotas.
            } else if (configs[from]?.antilink) {
                const linkPlat = detectLinkPlatform(body);
                const platCfg = configs[from]?.antilinkConfig?.platforms;
                // Link de DM (wa.me, api.whatsapp.com/send…) é sempre bloqueado; o toggle "whatsapp" libera só o convite de grupo.
                const isPlatBlocked = linkPlat === 'whatsapp_dm' || (platCfg ? (platCfg[linkPlat] !== false) : true);

                if (isPlatBlocked) {
                    try {
                        const senderNum = sender.split('@')[0].split(':')[0];
                        const { removerMembro, mensagemFalha } = require('../services/groupRemovalService');

                        // 1. ELE BANE PRIMEIRO (Remoção imediata do membro infrator)
                        const resultado = await removerMembro(client, from, sender, { origem: 'antilink' });

                        // 2. DEPOIS MOSTRA O MOTIVO E ORIENTAÇÕES DE PARCERIA
                        let motivoMsg = `╔══════════════════════════════╗\n`;
                        motivoMsg += `║     🚫 *BANIMENTO APLICADO* ⚡    ║\n`;
                        motivoMsg += `╚══════════════════════════════╝\n\n`;
                        motivoMsg += `👤 *Infrator:* @${senderNum}\n`;
                        const rotuloPlat = linkPlat === 'whatsapp_dm' ? 'WHATSAPP (DM)' : linkPlat.toUpperCase();
                        motivoMsg += `📜 *Motivo:* Envio de link [${rotuloPlat}] não autorizado sem parceria ou permissão prévia.\n`;

                        if (!resultado.ok) {
                            motivoMsg += `\n⚠️ *Aviso do Sistema:* ${mensagemFalha(resultado.motivo, sender)}\n`;
                        }

                        motivoMsg += `\n🤝 *Quer divulgar seu link neste grupo?*\n`;
                        motivoMsg += `Para divulgar links, grupos ou canais, feche uma parceria oficial (sem limites diários):\n`;
                        motivoMsg += `• Chame um administrador no privado (DM)\n`;
                        motivoMsg += `• Peça afiliação ou parceria com o dono do grupo (\`.dono\`)\n`;
                        motivoMsg += `• Administradores podem conceder permissão no grupo ou DM com: \`.parceria add @user\` ou \`.antilink allow @user\`\n\n`;
                        motivoMsg += `👑 *GOAT Prime*`;

                        await client.sendMessage(from, {
                            text: motivoMsg,
                            mentions: [sender]
                        });

                        // 3. E POR FIM APAGA A MENSAGEM DO LINK
                        if (isBotAdmin && info?.key) {
                            try {
                                await client.sendMessage(from, { delete: info.key });
                            } catch (delErr) {
                                logger.warn(`[ANTILINK] Falha ao apagar link de ${sender} em ${from}: ${delErr.message}`);
                            }
                        }
                    } catch (linkErr) {
                        logger.error('[ANTILINK ERROR]', linkErr);
                    }
                    return;
                }
            }
        }

        // Filtro de Palavras Proibidas (.blacklistword) — apaga a mensagem e advertE.
        // Compara sem acento/caixa para pegar variações simples ("Ódio" = "odio").
        if (configs[from]?.blacklistWordsEnabled && !isAdmin && !isOwner) {
            const lista = Array.isArray(configs[from]?.blacklistWords) ? configs[from].blacklistWords : []
            const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
            const corpo = norm(body)
            const achou = lista.length && corpo ? lista.find(p => corpo.includes(norm(p))) : null
            if (achou) {
                try {
                    if (isBotAdmin && info?.key) {
                        await client.sendMessage(from, { delete: info.key })
                            .catch(e => logger.warn(`[BLACKLIST WORD] Falha ao apagar mensagem de ${sender} em ${from}: ${e.message}`))
                    }
                    const warns = dataService.getWarnsData()
                    warns[sender] = (warns[sender] || 0) + 1
                    const totalWarns = warns[sender]
                    await dataService.saveWarnsData(warns)
                    // warnLimit do bloco de links não existe neste escopo: sem esta
                    // linha o filtro lançava ReferenceError e o aviso nunca saía.
                    const warnLimit = configs[from]?.warnLimit || 3

                    if (totalWarns >= warnLimit) {
                        const { removerMembro, mensagemFalha } = require('../services/groupRemovalService')
                        const resultado = await removerMembro(client, from, sender, { origem: 'palavra-proibida' })
                        if (resultado.ok) {
                            warns[sender] = 0
                            await dataService.saveWarnsData(warns)
                        }
                        await client.sendMessage(from, {
                            text: resultado.ok
                                ? `🚫 @${sender.split('@')[0]} chegou a ${warnLimit} advertências por usar palavras proibidas e foi removido do grupo.`
                                : `🚫 @${sender.split('@')[0]} chegou a ${warnLimit} advertências por usar palavras proibidas.\n\n${mensagemFalha(resultado.motivo, sender)}`,
                            mentions: [sender]
                        })
                    } else {
                        await client.sendMessage(from, {
                            text: `🚫 @${sender.split('@')[0]}, essa palavra não é permitida neste grupo${isBotAdmin ? ', então apaguei sua mensagem' : ''}. Advertência *${totalWarns} de ${warnLimit}*.`,
                            mentions: [sender]
                        })
                    }
                } catch (blErr) {
                    logger.error('[BLACKLIST WORD ERROR]', blErr)
                }
                return
            }
        }

        // Verificação de Anti-Trava
        if (configs[from]?.antitrava && !isAdmin && !isOwner) {
            const travaCheck = detectTravaZap(body)
            if (travaCheck.isTrava) {
                try {
                    logger.warn(`[ANTITRAVA] Trava de ${sender} em ${from}: ${travaCheck.reason}`)
                    await client.sendMessage(from, {
                        text: `🛡️ A mensagem de @${sender.split('@')[0]} foi feita para travar o WhatsApp de quem abre. Por segurança, estou tirando essa pessoa do grupo.`,
                        mentions: [sender]
                    })
                    const { removerMembro, mensagemFalha } = require('../services/groupRemovalService')
                    const resultado = await removerMembro(client, from, sender, { origem: 'antitrava' })
                    if (!resultado.ok) {
                        await client.sendMessage(from, { text: mensagemFalha(resultado.motivo, sender), mentions: [sender] })
                    }
                } catch (travaErr) {
                    logger.error('[ANTITRAVA ERROR]', travaErr)
                }
                return
            }
        }

        // Verificação de Anti-Spam / Anti-Flood
        if (configs[from]?.antispam && !isAdmin && !isOwner) {
            const spamCheck = checkGroupSpam(from, sender)
            if (spamCheck.isSpam) {
                try {
                    await client.sendMessage(from, {
                        text: `⚠️ @${sender.split('@')[0]}, você está mandando mensagens rápido demais. Vá com calma para não encher o grupo.`,
                        mentions: [sender]
                    }, { quoted: info })
                } catch (e) {
                    logger.warn(`[ANTISPAM] Falha ao avisar ${sender} em ${from}: ${e.message}`)
                }
                return
            }
        }

        // Tesouro coletivo: a mensagem que passou pelas regras soma ao pote
        // (1 vez por pessoa por minuto; gravação agrupada no serviço).
        groupProtectionService.registrarMensagemTesouro(from, sender, configs[from])
    }

    // Verificação de Bloqueio Global ou Restrição de Privado (DM Ban)
    if (!isGroup && !isOwner) {
        let dmBan = null
        try {
            const db = getDatabase()
            dmBan = db.prepare('SELECT jid, reason, blocked_by, created_at FROM dm_restrictions WHERE jid = ? OR jid = ?').get(sender, senderReal || sender)
        } catch (e) {
            // Silencioso aqui era PERIGOSO: se a consulta falha, dmBan fica null
            // e quem esta banido do PV passa direto, sem ninguem perceber.
            logger.error(`[DM BAN] Falha ao consultar restricao de ${sender}: ${e.message}`)
        }

        if (dmBan) {
            const mentions = [sender]
            const temAutor = Boolean(dmBan.blocked_by && dmBan.blocked_by.includes('@'))
            if (temAutor) mentions.push(dmBan.blocked_by)

            let aviso = `🚫 Você não pode mais falar comigo no privado.\n\n`
            aviso += `*Motivo:* ${dmBan.reason || 'descumprimento das regras do privado'}\n`
            aviso += `*Bloqueado por:* ${temAutor ? '@' + dmBan.blocked_by.split('@')[0] : 'administração'}\n`
            if (dmBan.created_at) aviso += `*Data:* ${dmBan.created_at}\n`
            aviso += `\nSe quiser pedir revisão, fale com a administração em um dos grupos onde eu estou.`

            return client.sendMessage(from, {
                text: aviso,
                mentions
            }, { quoted: info })
        }

        // Subdonos (usuários com aluguel do Bot ou PV ativo) têm acesso exclusivo ao privado
        const rentalService = require('../services/rentalService');
        const botRental = rentalService.hasActiveRental(sender, 'bot', [senderReal]);
        const pvRental = rentalService.hasActiveRental(sender, 'pv', [senderReal]);
        const isSubowner = botRental.active || pvRental.active;

        const isEssentialDmCmd = /^[.!\/](dono|donos|menu|help|login|registrar|aluguel|planos|assinar|ping|status)(\s|$)/i.test(body.trim());
        if (configs['global']?.blockAllDMs && !isSubowner && !isEssentialDmCmd) {
            return client.sendMessage(from, {
                text: '🔒 No momento eu só atendo no privado quem tem um plano de aluguel ativo.\n\nPara contratar, veja os planos nos grupos oficiais.'
            }, { quoted: info })
        }

        // Verificação de convites para grupos no privado (Auto-Reject)
        if (configs['global']?.autoRejectInvites) {
            const isInvite = /(chat\.whatsapp\.com\/|wa\.me\/settings\/linked_devices)/i.test(body) || type === 'groupInviteMessage'
            if (isInvite) {
                return client.sendMessage(from, {
                    text: `🚫 Não entro em grupos por convite enviado no privado. Para me levar a um grupo, fale com meu dono: \`${configs[from]?.prefix || configs['global']?.prefix || env.prefix || '.'}dono\`.`
                }, { quoted: info })
            }
        }
    }

    // Função de resposta com quote.
    //
    // O jargão técnico é barrado mais adiante, no próprio client.sendMessage
    // (ver core/connection.js) — assim vale também para os comandos que enviam
    // direto, sem passar por aqui.
    const reply = async (texto, mentions = []) => {
        const sent = await client.sendMessage(from, {
            text: String(texto),
            mentions: Array.isArray(mentions) ? mentions : []
        }, { quoted: info })
        // Guarda a chave para o .limparbot poder apagar depois (o Baileys 7 não
        // tem mais store embutido, então mantemos o nosso).
        try {
            require('../services/botMessageStore').record(from, sent?.key)
        } catch (e) {
            logger.warn(`[BOT MESSAGE STORE] Falha ao guardar a chave da resposta em ${from}: ${e.message}`)
        }
        return sent
    }


    // Função universal de reação por emoji no WhatsApp (segura e não-bloqueante)
    const react = async (emoji) => {
        try {
            if (client?.sendMessage && info?.key && emoji) {
                return await client.sendMessage(from, { react: { text: String(emoji), key: info.key } })
            }
        } catch (e) {
            logger.warn(`[REACT] Falha ao reagir com ${emoji} em ${from}: ${e.message}`)
        }
    }

    // Extração profunda de Mensagem Citada / Marcada (Quoted Message)
    //
    // Lida do conteúdo JÁ DESEMBRULHADO e de qualquer tipo que carregue
    // contextInfo. Antes vinha só de `info.message.extendedTextMessage`: em grupo
    // com mensagens temporárias (ephemeralMessage) responder a alguém não chegava
    // a comando nenhum — o .dossie, por exemplo, caía na ficha de quem pediu.
    const contextInfo = conteudo?.extendedTextMessage?.contextInfo
        || conteudo?.[type]?.contextInfo
        || null
    const quotedMsg = contextInfo?.quotedMessage || null
    let quotedText = ''
    if (quotedMsg) {
        quotedText = quotedMsg.conversation ||
                     quotedMsg.extendedTextMessage?.text ||
                     quotedMsg.imageMessage?.caption ||
                     quotedMsg.videoMessage?.caption ||
                     quotedMsg.documentMessage?.caption || ''
    }
    const quotedSender = contextInfo?.participant || null
    const isQuoted = !!quotedMsg

    // Provisiona ambiente novo antes de qualquer decisão de comando.
    // Sem isto, um grupo recém-adicionado fica mudo até alguém descobrir que
    // precisa rodar `.modulo on all` lá dentro — e o sintoma ("o bot lê e não
    // responde") não aponta para a causa em lugar nenhum.
    try {
        const moduleStateSvc = require('../services/moduleStateService')
        moduleStateSvc.provisionIfNew(moduleStateSvc.scopeOf(from, isGroup))
    } catch (errProv) {
        logger.warn(`[BOOT SCOPE] Falha ao provisionar ambiente ${from}: ${errProv.message}`)
    }

    // Verificação de prefixo dinâmico (por grupo ou global)
    const prefix = configs[from]?.prefix || configs['global']?.prefix || env.prefix || '.'

    // TRACE de diagnóstico — ligado por `configs.global.debugMensagens`.
    // Registra o que chega e por qual caminho segue, para não precisar adivinhar
    // por que "o comando não funciona". Desligue quando terminar o diagnóstico.
    if (configs.global?.debugMensagens) {
        const amostra = String(body || '').slice(0, 24).replace(/\n/g, ' ')
        logger.info(`[TRACE] de=${String(sender).slice(0, 22)} em=${isGroup ? 'grupo' : 'pv'}:${String(from).slice(0, 20)} tipo=${type} prefixo=${JSON.stringify(prefix)} corpo=${JSON.stringify(amostra)} -> ${body.startsWith(prefix) ? 'COMANDO' : 'texto livre'}`)
    }

    let commandName
    let rawArgs
    let directText

    if (body.startsWith(prefix)) {
        rawArgs = body.slice(prefix.length).trim().split(/ +/)
        commandName = rawArgs.shift()?.toLowerCase()
        directText = rawArgs.join(' ').trim()
    } else {
        // Resposta LIVRE a um jogo/fluxo ativo (ex.: responder o .quiz sem prefixo).
        // Oferecida ANTES do fallback de IA para não "comer" respostas de jogo.
        if (body && body.trim()) {
            const interactionService = require('../services/interactionService')
            if (interactionService.has(from)) {
                const consumed = await interactionService.consume(from, sender, body.trim(), {
                    from, sender, reply, isGroup, client, info
                })
                if (consumed) {
                    await dataService.saveXpData(xpData)
                    return
                }
            }
        }

        // Em grupo LID a menção e o autor citado chegam como "<lid>@lid", sem o
        // número de telefone — comparar dígitos do número nunca batia, e "@bot" e
        // a resposta a uma mensagem do bot passavam despercebidos.
        const isBotMentioned = isGroup && (contextInfo?.mentionedJid || []).some(j => groupAuthService.isBotJid(j, client))
        const respondeuBot = Boolean(contextInfo?.participant && groupAuthService.isBotJid(contextInfo.participant, client))

        // ── MOTOR DE INTENÇÃO E AÇÃO AUTÔNOMA (24H Engine) ──────────────────
        // Resolve comandos sem prefixo, linguagem natural ou modo conversacional ChatGPT
        const autonomousIntent = require('../services/autonomousIntentService')
        const action = autonomousIntent.resolveAutonomousAction(body, {
            from, sender, isGroup, isBotMentioned, respondeuBot, configs
        })

        if (action.isCommand) {
            commandName = action.commandName
            rawArgs = action.args || []
            directText = action.directText || ''
        } else if (action.isChat) {
            // Motor Conversacional estilo ChatGPT & GOAT Prime 24/7 adaptativo
            const seguranca = require('../services/securityService')
            if (seguranca.isUserBanned(sender)) {
                await dataService.saveXpData(xpData)
                return
            }
            const limite = seguranca.checkRateLimit(sender, isOwner === true)
            if (limite.blocked) {
                if (limite.reason) await reply(limite.reason)
                await dataService.saveXpData(xpData)
                return
            }

            const aiLearning = require('../services/aiLearningService')
            const chatReply = await aiLearning.generateChatGPTReply(action.cleanPrompt, sender, { from, isGroup, client })
            await reply(chatReply)
            await dataService.saveXpData(xpData)
            return
        } else {
            // Se for grupo, avalia respostas espontâneas de nicho (vagas, vendas, estudos)
            if (isGroup) {
                const autonomousGroup = require('../services/groupAutonomousAgentService')
                try {
                    const handled = await autonomousGroup.handleGroupMessage({
                        client, from, sender, body, isBotMentioned, respondeuBot, prefix, reply
                    })
                    if (handled) {
                        await dataService.saveXpData(xpData)
                        return
                    }
                } catch (autoErr) {
                    logger.warn(`[AUTONOMOUS HANDLER] Falha silenciosa ao processar em ${from}: ${autoErr.message}`)
                }
            }

            // Menção sem texto útil: apresenta-se, em vez de ficar mudo.
            if (isBotMentioned && !body.replace(/@\d+/g, '').trim()) {
                const { getBotName } = require('../config/botConfig')
                await reply(`⚽ Fala, @${sender.split('@')[0]}! Aqui é o ${getBotName()}, o Camisa 10 do time. Digite \`${prefix}menu\` para ver os comandos e táticas.`, [sender])
                await dataService.saveXpData(xpData)
                return
            }

            await dataService.saveXpData(xpData)
            return
        }
    }

    // Resposta interativa e guia de uso quando o usuário envia apenas o prefixo (ex: .)
    if (!commandName) {
        const cleanSender = sender.split('@')[0].split(':')[0]

        let guideDoc = `👋 Oi, @${cleanSender}! Todo comando começa com \`${prefix}\`.\n\n`
        guideDoc += `• \`${prefix}menu\` — tudo o que eu faço\n`
        guideDoc += `• \`${prefix}dossie\` — seu perfil\n`
        guideDoc += `• \`${prefix}livro <título>\` — procurar um livro\n`
        guideDoc += `• \`${prefix}media <link>\` — baixar vídeo ou música\n`
        guideDoc += `• \`${prefix}fig\` — transformar imagem em figurinha\n`
        guideDoc += `• \`${prefix}slayer\` — sua ficha de aventureiro\n`
        guideDoc += `• \`${prefix}ia <pergunta>\` — tirar uma dúvida\n`
        guideDoc += `• \`${prefix}cassino\` — apostar suas moedas\n\n`
        guideDoc += `Dúvida sobre um comando? \`${prefix}help <comando>\``

        await reply(guideDoc.trim(), [sender])
        await dataService.saveXpData(xpData)
        return
    }

    // Se o usuário não digitou texto no comando, mas marcou/respondeu a uma mensagem com link/texto, herda o conteúdo automaticamente
    const text = directText || quotedText.trim()
    const args = directText ? rawArgs : (quotedText ? quotedText.trim().split(/ +/) : [])

    // Verificação de Comandos Desativados no Grupo (.cmd off / .cmd all off)
    // Compara pelo nome principal: desligar o .play precisa desligar também
    // .musica, .tocar e os outros apelidos (antes só o nome digitado contava).
    const disabledList = configs[from]?.disabledCommands || []
    const nomePrincipal = findCommand(commandName)?.name || commandName
    const desligados = new Set(disabledList.map(c => findCommand(c)?.name || c))
    const isCmdDisabledInGroup = desligados.has('all') || desligados.has(nomePrincipal)
    if (isCmdDisabledInGroup && !isAdmin && !isOwner) {
        const immuneAdminCmds = ['cmd', 'adm', 'setprefix', 'fechargrupo', 'abrirgrupo', 'menu', 'help']
        if (!immuneAdminCmds.includes(nomePrincipal)) {
            return reply(`🔒 A administração desligou o \`${prefix}${nomePrincipal}\` neste grupo. Por enquanto, só administradores podem usar.`)
        }
    }

    const mentionedJid = contextInfo?.mentionedJid || []

    const context = {
        commandName,
        args,
        text,
        directText,
        body,
        from,
        sender,
        senderReal,
        isGroup,
        isAdmin,
        isBotAdmin,
        isOwner,
        client,
        reply,
        react,
        // Os comandos recebem a mensagem já desembrulhada: ~80 deles leem
        // `info.message.extendedTextMessage.contextInfo` direto, e com o envelope
        // das mensagens temporárias essa leitura dava sempre vazio.
        info: conteudo !== info.message ? { ...info, message: conteudo } : info,
        type,
        quotedMsg,
        quotedText,
        quotedSender,
        isQuoted,
        prefix,
        user,
        mentionedJid
    }

    // Gate de registro: LOGIN OBRIGATÓRIO PARA TODO COMANDO, em grupo e no PV,
    // para todo mundo — EXCETO o dono. Decisão do dono (2026-09-21): o cadastro
    // é a base do sistema de dados global do bot, uma conta só que vale em
    // qualquer grupo e no privado. Sem ela, só o próprio .login responde.
    //
    // Em 2026-10-15 o próprio dono pediu que donos nunca sejam barrados (o bot
    // recusava todos os comandos dele enquanto não havia conta). Para os demais
    // a regra segue igual; não afrouxe para eles sem o dono pedir.
    //
    // A checagem é pelo que a pessoa digitou, não só por comando existente: o
    // dispatch tem atalhos (seção direta como `.rpg`, link colado `.https://…`)
    // que não são comandos registrados e passariam por baixo da trava.
    const ehLogin = findCommand(commandName)?.name === 'login'

    if (!user.registered && !ehLogin && !isOwner) {
        // Mesma moldura dos demais comandos: quem ainda não tem conta é quem mais precisa saber
        // o que ganha — antes era uma frase seca e a pessoa não via por que cadastrar.
        const F = require('../utils/formato')
        const aviso = F.tela({
            emoji: '📜',
            titulo: 'Crie seu login',
            intro: `@${sender.split('@')[0]}, antes de usar qualquer comando você precisa criar seu login — é uma conta só, que vale em todos os grupos e no privado.`,
            secoes: [
                {
                    emoji: '✨',
                    titulo: 'O que você libera',
                    linhas: F.lista([
                        'Baixar músicas e vídeos (YouTube, TikTok, Instagram, Spotify, X…)',
                        'RPG, jogos e economia — seu progresso fica salvo',
                        'IA, figurinhas, ferramentas e utilidades',
                        'Perfil, ranking e conquistas'
                    ])
                },
                {
                    emoji: '⏱️',
                    titulo: 'Leva 10 segundos',
                    linhas: F.lista([
                        `Crie com ${F.cmd(prefix, 'login', '<seu nick>')}`,
                        `Exemplo: ${F.cmd(prefix, 'login', 'Dragão Slayer')}`
                    ])
                }
            ],
            proximos: [{ nome: 'login', args: '<seu nick>', oque: 'criar seu cadastro agora' }],
            prefix
        })
        await reply(aviso, [sender])
        await dataService.saveXpData(xpData)
        return
    }

    await dispatch(context)
}

module.exports = {
    handleIncomingMessage,
    invalidateGroupCache,
    _recentMessages,
    recordRecentMessage
}

