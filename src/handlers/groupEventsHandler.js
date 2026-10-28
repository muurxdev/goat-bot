/**
 * Group Events Handler
 * Processa eventos em tempo real de grupos (Entrada, Saída, Promoção e Rebaixamento de Admins)
 * com suporte completo a mensagens personalizadas e templates dinâmicos
 */

const dataService = require("../services/dataService");
const { getWallpaperBuffer } = require("../utils/wallpapers");
const logger = require("../core/logger");
const groupAuthService = require("../services/groupAuthService");
const groupRemovalService = require("../services/groupRemovalService");
const groupProtectionService = require("../services/groupProtectionService");
const figurinhaEventoService = require("../services/figurinhaEventoService");
const audioEventoService = require("../services/audioEventoService");
// Fonte única das mensagens de saudação (mesma usada pelo .welcome/.leave -config).
const { formatTemplate, getGreetingVars, resolveMentionsForText, buildWelcomeMessage, buildLeaveMessage } = require("../services/groupGreetingService");

async function handleGroupParticipantsUpdate(client, update) {
    const { id: groupJid, participants, action, author } = update;
    if (!groupJid || !participants || !Array.isArray(participants) || participants.length === 0) return;

    const configs = dataService.getConfigsData();
    const groupConfig = configs[groupJid] || {};

    const welcomeEnabled = (groupConfig.welcome === true || groupConfig.welcomeEnabled === true || groupConfig.welcome === 1 || groupConfig.welcome === "on" || groupConfig.welcome === "true") && 
                           (groupConfig.welcome !== false && groupConfig.welcome !== "false" && groupConfig.welcome !== "off" && groupConfig.welcome !== 0 && groupConfig.welcome !== "0" && groupConfig.welcomeEnabled !== false);

    const leaveEnabled = (groupConfig.leave === true || groupConfig.leaveEnabled === true || groupConfig.leave === 1 || groupConfig.leave === "on" || groupConfig.leave === "true") && 
                         (groupConfig.leave !== false && groupConfig.leave !== "false" && groupConfig.leave !== "off" && groupConfig.leave !== 0 && groupConfig.leave !== "0" && groupConfig.leaveEnabled !== false);

    const eventsEnabled = groupConfig.events !== false && groupConfig.events !== "false" && groupConfig.events !== "off" && groupConfig.events !== 0 && groupConfig.events !== "0";

    // Com eventos desligados ainda é preciso olhar as entradas: o banimento
    // temporário (.timeban) vale mesmo sem boas-vindas.
    if (!eventsEnabled && action !== "add") return;

    let groupName = "Grupo";
    let groupDesc = "";
    let memberCount = 0;

    try {
        const meta = await client.groupMetadata(groupJid);
        if (meta?.subject) groupName = meta.subject;
        if (meta?.desc) groupDesc = meta.desc;
        if (meta?.participants) memberCount = meta.participants.length;
    } catch (e) {
        // Sem metadata a saudacao sai com nome/contagem genericos. Registrar
        // evita "por que o welcome nao mostra o nome do grupo?" sem resposta.
        logger.warn(`[GROUP EVENT] Sem metadata de ${groupJid}: ${e.message}`);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });

    for (const p of participants) {
        const participant = typeof p === "string" ? p : (p?.id || p?.jid || String(p));

        // O próprio bot não recebe boas-vindas, despedida nem "parabéns" por ser
        // promovido — acontecia ao promover o número novo, o bot se parabenizava.
        if (groupAuthService.isBotJid(participant, client) || (typeof p === "object" && groupAuthService.isBotJid(p?.phoneNumber, client))) {
            logger.info("[GROUP_EVENT] Evento " + action + " do próprio bot em " + groupJid + " — sem anúncio.");
            continue;
        }

        // Banimento temporário (.timeban): quem volta antes do prazo sai de novo.
        if (action === "add") {
            try {
                const ban = await groupRemovalService.buscarBanTemporario(client, groupJid, p);
                if (ban) {
                    const resultado = await groupRemovalService.removerMembro(client, groupJid, participant, { origem: "timeban-retorno" });
                    const num = participant.split("@")[0].split(":")[0];
                    const min = Math.max(1, Math.ceil((ban.expiresAt - Date.now()) / 60000));
                    const falta = min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`;
                    await client.sendMessage(groupJid, {
                        text: resultado.ok
                            ? `⏳ @${num} voltou antes do fim do banimento temporário e foi removido de novo. Ainda falta *${falta}*.`
                            : `⏳ @${num} está com banimento temporário (ainda falta ${falta}).\n\n${groupRemovalService.mensagemFalha(resultado.motivo, participant)}`,
                        mentions: [participant]
                    });
                    continue;
                }
            } catch (banErr) {
                logger.error("[TIMEBAN] Falha ao conferir banimento temporário de " + participant + " em " + groupJid + ":", banErr);
            }
        }

        // Anti-fake (.antifake): quem entra com número de fora do Brasil sai.
        if (action === "add") {
            try {
                if (await groupProtectionService.aplicarAntifake(client, groupJid, p, groupConfig)) continue;
            } catch (fakeErr) {
                logger.error("[ANTIFAKE] Falha ao conferir o número de " + participant + " em " + groupJid + ":", fakeErr);
            }
        }

        if (!eventsEnabled) continue;

        const userNumber = participant.split("@")[0].split(":")[0];
        const userTag = "@" + userNumber;
        let mentions = [participant];
        if (author && typeof author === "string" && author.includes("@")) mentions.push(author);

        try {
            // 1. ENTRADA DE NOVO MEMBRO (ADD)
            if (action === "add" && welcomeEnabled) {
                const greetingVars = await getGreetingVars(client, groupJid, participant);
                const captionText = buildWelcomeMessage(groupConfig, greetingVars);
                mentions = resolveMentionsForText(captionText, greetingVars);
                if (author && typeof author === "string" && author.includes("@") && !mentions.includes(author)) mentions.push(author);

                // O padrão oficial de alta qualidade utiliza o wallpaper Full HD de boas-vindas (welcome.jpg).
                // Caso o grupo tenha configurado explicitamente 'card', tenta o cartão customizado com avatar.
                let cartaoBv = null;
                if (groupConfig?.welcomeMedia === 'card' && captionText.length <= 1024) {
                    try {
                        const cartao = require("../services/cartaoService");
                        const perfilNovo = dataService.getUser(participant);
                        cartaoBv = await cartao.cartaoBoasVindas({
                            nome: perfilNovo?.displayNick || perfilNovo?.name || userTag,
                            grupo: groupName,
                            membros: memberCount,
                            foto: await cartao.fotoDePerfil(client, participant)
                        });
                    } catch (errCartao) {
                        logger.warn("[GROUP_EVENT] Cartão de boas-vindas não saiu, uso a imagem padrão: " + errCartao.message);
                    }
                }
                if (cartaoBv) {
                    await client.sendMessage(groupJid, { image: cartaoBv, caption: captionText, mentions });
                } else {
                    const { sendMenuMediaMessage } = require("../utils/wallpapers");
                    await sendMenuMediaMessage(client, groupJid, {
                        category: "welcome",
                        text: captionText,
                        mentions
                    });
                }
                logger.info("[GROUP_EVENT] Welcome enviado para @" + userNumber + " em " + groupJid);
                await figurinhaEventoService.enviar(client, groupJid, "boasvindas", { excludeWallpaper: "welcome" });
                await audioEventoService.enviar(client, groupJid, "boasvindas");
            }

            // 1.1 CARGO AUTOMÁTICO (.autorole) — grava no perfil de quem entrou.
            // Roda independente do welcome estar ligado.
            if (action === "add") {
                const autoRole = groupConfig?.autoRole;
                if (autoRole?.enabled && autoRole.cargo) {
                    try {
                        const user = dataService.getUser(participant) || { jid: participant };
                        if (!user.cargos || typeof user.cargos !== "object") user.cargos = {};
                        user.cargos[groupJid] = autoRole.cargo;
                        dataService.saveUser(user);
                        logger.info("[AUTOROLE] Cargo \"" + autoRole.cargo + "\" atribuído a @" + userNumber + " em " + groupJid);

                        if (autoRole.anunciar) {
                            await client.sendMessage(groupJid, {
                                text: "🎖️ @" + userNumber + " recebeu o cargo *" + autoRole.cargo + "*. Dá para ver no `.dossie`.",
                                mentions: [participant]
                            });
                        }
                    } catch (roleErr) {
                        logger.error("[AUTOROLE ERROR] Falha ao atribuir cargo a " + participant + ":", roleErr);
                    }
                }
            }

            // 2. SAÍDA DE MEMBRO (REMOVE)
            else if (action === "remove" && leaveEnabled) {
                const greetingVars = await getGreetingVars(client, groupJid, participant);
                const captionText = buildLeaveMessage(groupConfig, greetingVars);
                mentions = resolveMentionsForText(captionText, greetingVars);
                if (author && typeof author === "string" && author.includes("@") && !mentions.includes(author)) mentions.push(author);

                const { sendMenuMediaMessage } = require("../utils/wallpapers");
                await sendMenuMediaMessage(client, groupJid, {
                    category: "leave",
                    text: captionText,
                    mentions
                });
                logger.info("[GROUP_EVENT] Leave enviado para @" + userNumber + " em " + groupJid);

                // Removido por um admin pelo próprio WhatsApp = banimento. Removido
                // pelo bot: o comando (.ban/.kick) já mandou a figurinha dele.
                if (!groupAuthService.isBotJid(author, client)) {
                    const removidoPorOutro = typeof author === "string" && author.includes("@") && !groupAuthService.sameUser(author, participant);
                    const eventoSaida = removidoPorOutro ? "banimento" : "despedida";
                    await figurinhaEventoService.enviar(client, groupJid, eventoSaida, { excludeWallpaper: "leave" });
                    await audioEventoService.enviar(client, groupJid, eventoSaida);
                }
            }

            // 3. PROMOÇÃO A ADMINISTRADOR (PROMOTE)
            else if (action === "promote") {
                const text = "⭐ " + userTag + " agora faz parte da administração do *" + groupName + "*. Parabéns!";

                await client.sendMessage(groupJid, { text, mentions });
                logger.info("[GROUP_EVENT] Promote notificado para @" + userNumber + " em " + groupJid);
                await figurinhaEventoService.enviar(client, groupJid, "promocao");
                await audioEventoService.enviar(client, groupJid, "promocao");
            }

            // 4. REBAIXAMENTO DE ADMINISTRADOR (DEMOTE)
            else if (action === "demote") {
                const text = "🔻 " + userTag + " saiu da administração do *" + groupName + "*.";
                await client.sendMessage(groupJid, { text, mentions });
                logger.info("[GROUP_EVENT] Demote notificado para @" + userNumber + " em " + groupJid);
                await figurinhaEventoService.enviar(client, groupJid, "rebaixamento");
                await audioEventoService.enviar(client, groupJid, "rebaixamento");
            }
        } catch (err) {
            logger.error("[GROUP_EVENT_ERROR] Falha ao processar " + action + " para " + participant + " em " + groupJid + ":", err);
        }
    }
}

module.exports = {
    handleGroupParticipantsUpdate,
    formatTemplate
};
