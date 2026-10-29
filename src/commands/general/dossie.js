const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando Central .dossie / .perfil
 * Exibe o dossiê detalhado com 100% de persistência e dados reais do SQLite
 */

const dataService = require("../../services/dataService");
const { q } = require("../../database/connection");
const { initializeUser, getCargo, calcularXpNecessario } = require("../../services/xpService");
const { calculateCharacterStats, getItem } = require("../../services/rpgEquipmentService");
const { getOwnerRank } = require("../../services/ownerService");
const { resolveUserRole, ROLES } = require("../../services/permissionService");
const { getAdvancedNetworkTelemetry } = require("../../services/telemetryDeviceService");
const groupAuthService = require("../../services/groupAuthService");
const { getBotName } = require("../../config/botConfig");
const env = require("../../config/env");
const logger = require("../../core/logger");
const F = require("../../utils/formato");
const cartao = require("../../services/cartaoService");
const { moedas, formatNumber, plural } = require("../../utils/textoRpg");

module.exports = {
    name: "dossie",
    aliases: ["dossier", "ficha", "investigar", "info-user", "perfilcompleto", "meuperfil"],
    category: "general",
    subcategory: "Perfil & Ranking",
    description: "Mostra a ficha completa de alguém: aventura, dinheiro, atividade, aparelho e grupos em comum",
    usage: "[@pessoa | número]",
    examples: [
        " — mostra a sua ficha",
        "@pessoa — mostra a ficha de quem você marcou",
        "5511999999999 — mostra a ficha pelo número"
    ],
    cooldownMs: 2000,
    execute: async (ctx) => {
        // ".ficha" respondendo a uma MÍDIA é a ficha do arquivo, não da pessoa.
        // Até 2026-09-21 o apelido só abria o dossiê: quem arrastava um vídeo e
        // mandava .ficha recebia os próprios dados e achava que o comando de
        // ficha técnica (.mediainfo) nem existia.
        if (String(ctx.commandName || "").toLowerCase() === "ficha" && temMidia(ctx)) {
            return require("../media/mediainfo").execute(ctx);
        }
        return dossie(ctx);
    }
};

/** A mensagem respondida (ou a própria) traz vídeo, foto, áudio, figurinha ou documento? */
function temMidia({ quotedMsg, info }) {
    const TIPOS = ["videoMessage", "imageMessage", "audioMessage", "stickerMessage", "documentMessage", "ptvMessage"];
    const abrir = (m, n = 0) => {
        if (!m || n > 4) return m;
        for (const env of ["ephemeralMessage", "viewOnceMessage", "viewOnceMessageV2", "viewOnceMessageV2Extension", "documentWithCaptionMessage"]) {
            if (m[env]?.message) return abrir(m[env].message, n + 1);
        }
        return m;
    };
    const tem = m => Boolean(m && TIPOS.some(t => m[t]));
    return tem(abrir(quotedMsg)) || tem(abrir(info?.message));
}

async function dossie({ sender, senderReal, from, isGroup, isAdmin, isOwner, client, reply, info, args, mentionedJid, quotedSender, directText, prefix = "." }) {
        try {
            // Alvo: primeiro o que o handler já resolveu (menção e mensagem
            // respondida, com os envelopes do WhatsApp abertos), depois a leitura
            // direta. Antes só a leitura direta existia, e em grupo com mensagens
            // temporárias ela voltava vazia: a ficha saía de quem pediu.
            const ctxInfo = info?.message?.extendedTextMessage?.contextInfo
                || Object.values(info?.message || {}).find(m => m && typeof m === "object" && m.contextInfo)?.contextInfo;
            const mentioned = (Array.isArray(mentionedJid) && mentionedJid[0]) || ctxInfo?.mentionedJid?.[0];
            const quotedParticipant = quotedSender || ctxInfo?.participant;
            // Texto herdado da mensagem respondida não é argumento: sem isto um
            // número dentro da mensagem citada virava o alvo.
            if (directText === "") args = [];
            const argClean = (args && args[0]) ? args[0].replace(/[@\s]/g, "").replace(/\D/g, "") : "";
            const isExplicitTarget = Boolean(mentioned || quotedParticipant || (argClean && argClean.length >= 8));
            const targetJid = isExplicitTarget 
                ? (mentioned || quotedParticipant || (argClean + "@s.whatsapp.net")) 
                : (senderReal || sender);

            const isSelf = !isExplicitTarget || 
                           (targetJid.split("@")[0].split(":")[0] === sender.split("@")[0].split(":")[0]) ||
                           (senderReal && targetJid.split("@")[0].split(":")[0] === senderReal.split("@")[0].split(":")[0]);

            // Na própria ficha, os dois identificadores de quem pediu (LID e
            // número): o cadastro pode estar gravado por qualquer um deles.
            const targetCandidateJids = (isExplicitTarget ? [targetJid] : [targetJid, sender, senderReal]).filter(Boolean);
            let resolvedPhone = null;

            // Resolução de número real do WhatsApp em grupos
            if (isGroup && client && typeof client.groupMetadata === "function") {
                try {
                    const gmeta = await client.groupMetadata(from).catch((err) => {
                        logger.warn(`[DOSSIE] Não li os participantes de ${from}: ${err.message}`);
                        return null;
                    });
                    if (gmeta && gmeta.participants) {
                        const targetClean = targetJid.split("@")[0].split(":")[0];
                        const matchP = gmeta.participants.find(p => {
                            const pid = (p.id || "").split("@")[0].split(":")[0];
                            const plid = (p.lid || "").split("@")[0].split(":")[0];
                            return pid === targetClean || plid === targetClean;
                        });
                        if (matchP) {
                            if (matchP.id && matchP.id.endsWith("@s.whatsapp.net")) {
                                resolvedPhone = matchP.id.split("@")[0].split(":")[0];
                                targetCandidateJids.push(matchP.id);
                            }
                            if (matchP.lid) targetCandidateJids.push(matchP.lid);
                        }
                    }
                } catch (err) {
                    logger.warn(`[DOSSIE] Falha ao procurar ${targetJid} no grupo ${from}: ${err.message}`);
                }
            }

            if (client) {
                try {
                    const rReal = await groupAuthService.resolveRealJid(client, targetJid);
                    if (rReal) {
                        targetCandidateJids.push(rReal);
                        if (rReal.endsWith("@s.whatsapp.net")) resolvedPhone = rReal.split("@")[0].split(":")[0];
                    }
                    // resolvePnToLid nunca existiu: o TypeError sumia no catch
                    // vazio e o LID do alvo não entrava nos candidatos.
                    if (isGroup) {
                        const rLid = await groupAuthService.resolveMemberJid(client, targetJid, from);
                        if (rLid) targetCandidateJids.push(rLid);
                    }
                } catch (err) {
                    logger.warn(`[DOSSIE] Não resolvi os JIDs de ${targetJid}: ${err.message}`);
                }
            }

            const xpData = dataService.getXpData();
            const user = initializeUser(targetJid, xpData, targetCandidateJids);

            if (resolvedPhone && !user.phone) {
                user.phone = resolvedPhone;
            }
            if (user.phone) targetCandidateJids.push(user.phone + "@s.whatsapp.net");
            if (user.jid) targetCandidateJids.push(user.jid);
            if (user.lid) targetCandidateJids.push(user.lid);

            // Perfil oficial: exige registro real com .login
            if (!user.registered || !user.displayNick) {
                const isMe = (targetJid === sender || targetJid === senderReal);
                if (isMe) {
                    return reply(F.tela({
                        emoji: "📁",
                        titulo: "Você ainda não tem ficha",
                        intro: "Para eu montar sua ficha completa, primeiro preciso do seu cadastro. É rapidinho: só escolher um nick.",
                        secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                            `• ${F.cmd(prefix, "login", "<seu nick>")}`,
                            `• ${F.cmd(prefix, "login", "Dragão Negro")}`
                        ] }],
                        dica: "Depois do cadastro, é só mandar .dossie de novo.",
                        proximos: [{ nome: "login", args: "<seu nick>", oque: "fazer seu cadastro" }],
                        prefix
                    }), [targetJid]);
                }
                return reply(F.tela({
                    emoji: "📁",
                    titulo: "Essa pessoa ainda não tem ficha",
                    intro: `${nomeDoMembro(targetJid)} ainda não fez o cadastro, então não tenho ficha para mostrar.`,
                    dica: "Peça para ela usar .login com o nick que quiser.",
                    proximos: [{ nome: "dossie", oque: "ver a sua própria ficha" }],
                    prefix
                }), [targetJid]);
            }

            // Alocação de farm para registros históricos
            if ((user.messagesGroup === 0 && user.messagesPv === 0) && (user.messages || 0) > 0) {
                user.messagesGroup = user.messages;
                user.xpGroup = user.xp || 0;
                user.commandsGroup = Math.floor(user.messages * 0.1);
            }

            const tele = getAdvancedNetworkTelemetry(isSelf ? info : null, targetJid, sender, user);
            if (isSelf) {
                user.lastDevice = tele.device.model;
                user.lastPingMs = tele.pingMs;
                user.lastSeen = Date.now();
                if (info?.pushName && (!user.name || user.name !== info.pushName)) {
                    user.name = info.pushName;
                }
            }

            user.bank = Number(user.bank || user.banco || 0);
            user.banco = user.bank;
            dataService.saveUser(user);

            // Número de WhatsApp e menção clicável
            const isLidTarget = targetJid.endsWith("@lid") || (user.jid && user.jid.endsWith("@lid"));
            let phoneFormatted = "";
            let mentionTag = "";

            if (user.phone && /^\d{10,14}$/.test(user.phone)) {
                phoneFormatted = env.formatPhoneFromJid(user.phone + "@s.whatsapp.net");
                mentionTag = user.phone;
            } else if (!isLidTarget && /^\d{10,14}$/.test(targetJid.split("@")[0].split(":")[0])) {
                mentionTag = targetJid.split("@")[0].split(":")[0];
                phoneFormatted = env.formatPhoneFromJid(mentionTag + "@s.whatsapp.net");
            } else {
                mentionTag = targetJid.split("@")[0].split(":")[0];
                phoneFormatted = "🔒 oculto pelo WhatsApp";
            }
            const marca = "@" + mentionTag;

            // Hierarquia
            const targetOwnerRank = getOwnerRank(targetJid, targetCandidateJids);
            const isTargetOwner = Boolean(targetOwnerRank && targetOwnerRank.active);

            const userRole = resolveUserRole(targetJid, isAdmin, isTargetOwner);
            let cargoBot = "Membro";
            if (isTargetOwner && targetOwnerRank) {
                cargoBot = "👑 Dono do bot (" + targetOwnerRank.rank + ")";
            } else if (userRole.level >= ROLES.BOT_ADMIN) {
                cargoBot = "🛡️ Administrador do bot";
            } else if (userRole.level >= ROLES.TRUSTED) {
                cargoBot = "⭐ Pessoa de confiança";
            }

            // RPG e equipamentos
            const rpgStats = calculateCharacterStats(user);
            const nivel = user.level || 1;
            const maxXp = calcularXpNecessario(nivel);
            const currentXp = user.xp || 0;
            const cargoNome = getCargo(nivel);

            // Posição no ranking de XP: dentro do grupo quando a ficha é aberta
            // num grupo, entre todos no privado (o ranking global foi removido).
            let posicao = null;
            let rotuloPosicao = "entre todos";
            try {
                const { resolverEscopo, numeroDe } = require("../../services/rankingService");
                const escopo = await resolverEscopo({ from, isGroup });
                rotuloPosicao = escopo.rotulo;
                const acima = q("SELECT jid, lid FROM users WHERE registered = 1 AND COALESCE(xp, 0) > ?").all(currentXp)
                    .filter(r => !escopo.numeros || escopo.numeros.has(numeroDe(r.jid)) || (r.lid && escopo.numeros.has(numeroDe(r.lid))));
                posicao = acima.length + 1;
            } catch (err) {
                logger.warn(`[DOSSIE] Não calculei a posição de ${targetJid} no ranking: ${err.message}`);
            }

            // Grupos em comum
            const allIdentifiers = new Set(targetCandidateJids.concat([user.jid, user.phone ? (user.phone + "@s.whatsapp.net") : null]).filter(Boolean).map(j => j.split("@")[0].split(":")[0]));
            let sharedGroups = [];
            if (client && typeof client.groupFetchAllParticipating === "function") {
                try {
                    const fetchPromise = client.groupFetchAllParticipating();
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500));
                    const allGroups = await Promise.race([fetchPromise, timeoutPromise]);
                    if (allGroups && typeof allGroups === "object") {
                        const groupList = Object.values(allGroups);
                        sharedGroups = groupList
                            .filter(g => g.participants?.some(p => {
                                const pid = (p.id || p.jid || "").split("@")[0].split(":")[0];
                                return allIdentifiers.has(pid);
                            }))
                            .map(g => ({ id: g.id, name: g.subject || "Grupo sem nome" }));
                    }
                } catch (err) {
                    logger.warn(`[DOSSIE] Não listei os grupos em comum de ${targetJid}: ${err.message}`);
                }
            }

            // Número, nomes de outros grupos e links de convite são dados da própria
            // pessoa: antes qualquer membro via o telefone (mesmo oculto pelo LID) e
            // os convites de até 5 grupos de quem ele marcasse.
            const podeVerPrivado = isSelf || isOwner;
            if (podeVerPrivado && sharedGroups.length > 0 && client && typeof client.groupInviteCode === "function") {
                for (const g of sharedGroups.slice(0, 5)) {
                    try {
                        const code = await client.groupInviteCode(g.id);
                        if (code) {
                            g.link = "https://chat.whatsapp.com/" + code;
                        }
                    } catch (err) {
                        logger.warn(`[DOSSIE] Sem link de convite para ${g.id}: ${err.message}`);
                    }
                }
            }

            const totalCmds = (user.commandsGroup || 0) + (user.commandsPv || 0);
            const armaRef = user.slots?.arma || user.arma || user.equipado;
            const armaNome = armaRef ? (typeof armaRef === 'object' ? armaRef.nome : (getItem(armaRef)?.nome || user.arma || "Espada de Ferro")) : "Punhos de Ferro";
            const forgeSufixo = user.forgeLevel > 0 ? ` +${user.forgeLevel}` : "";

            const itensMochila = (user.inventario && Array.isArray(user.inventario)) ? user.inventario.length : 0;
            const capMochila = user.mochila || Math.max(20, Math.floor(nivel * 2));

            let pocaoInfo = null;
            if (user.pocaoAtiva && user.pocaoAtiva.expira > Date.now()) {
                const minutosRestantes = Math.max(0, Math.ceil((user.pocaoAtiva.expira - Date.now()) / 60000));
                pocaoInfo = (user.pocaoAtiva.tipo || "Bônus") + " (" + plural(minutosRestantes, "minuto restante", "minutos restantes") + ")";
            }

            const farmGrupoMsgs = user.messagesGroup || 0;
            const farmPvMsgs = user.messagesPv || 0;
            const farmGrupoXp = user.xpGroup || 0;
            const farmPvXp = user.xpPv || 0;
            const totalMensagens = (farmGrupoMsgs + farmPvMsgs) || user.messages || 0;
            const farmRpgXp = Number(user.xpRpg || user.xp_rpg || 0);

            const { resolveHp } = require("../../services/characterEngine");
            const _hp = resolveHp(user);

            const carteira = user.coins || 0;
            const banco = user.bank || 0;
            const nick = user.displayNick || user.nicknameRpg;
            const rebirths = Number(user.rebirthCount || user.rebirth_count || 0);
            const _cargoGrupo = (isGroup && user.cargos && typeof user.cargos === "object") ? user.cargos[from] : null;

            // Aparelho: deixa claro quando é detecção genérica (o WhatsApp não
            // envia o modelo) e quando é o modelo que a pessoa cadastrou.
            const _plat = tele.device.platform || (isSelf ? null : user.lastPlatform) || null;
            const nomePlat = { Web: "🌐 WhatsApp Web", Desktop: "💻 computador", Mobile: "📱 celular" }[_plat] || _plat;

            // Chefes mais derrotados
            const bossHistory = require("../../services/bossHistoryService");
            const chefes = bossHistory.resumoOrdenado(user);
            const linhasChefes = chefes.slice(0, 5).map(b => `${bossHistory.emojiDe(b.raridade)} *${b.nome}* — ${b.vezes}x (${bossHistory.dataRelativa(b.ultimo)})`);
            if (chefes.length > 5) linhasChefes.push(`e mais ${plural(chefes.length - 5, "chefe", "chefes")}; veja todos com ${prefix}bosses`);

            const doc = F.tela({
                emoji: "📁",
                titulo: `Ficha de ${nick}`,
                intro: `${marca} é *${cargoNome}* de nível *${formatNumber(nivel)}*` +
                    (posicao ? `, *${posicao}º* em XP ${rotuloPosicao}` : "") + ".\n" +
                    `💰 *${moedas(carteira + banco)}* no total · ⚡ *${formatNumber(rpgStats.cp)}* de poder` +
                    (userRole.level >= ROLES.BOT_ADMIN || isTargetOwner ? `\n${cargoBot}` : ""),
                secoes: [
                    { emoji: "⚔️", titulo: "Aventura", linhas: [
                        F.campo("Nível", `${formatNumber(nivel)} ${F.barra(maxXp ? currentXp / maxXp : 0)}`),
                        F.campo("XP", `${formatNumber(currentXp)} / ${formatNumber(maxXp)}`),
                        F.campo("Vida", `${formatNumber(_hp.atual)} / ${formatNumber(_hp.max)}`),
                        F.campo("Ataque e defesa", `${formatNumber(rpgStats.atk)} / ${formatNumber(rpgStats.def)}`),
                        F.campo("Arma", armaNome + forgeSufixo),
                        F.campo("Mochila", `${formatNumber(itensMochila)} / ${formatNumber(capMochila)} espaços`),
                        rebirths ? F.campo("Reencarnações", `${rebirths} (+${rebirths * 25}% de dano e XP)`) : null,
                        pocaoInfo ? F.campo("Poção ativa", pocaoInfo) : null,
                        F.campo("Guilda", user.guilda || "nenhuma"),
                        user.pet ? F.campo("Pet", user.pet) : null,
                        F.campo("Combates", `${formatNumber(user.wins || 0)} vitórias · ${formatNumber(user.losses || 0)} derrotas`),
                        F.campo("Arena", `${formatNumber(user.arenaPontos || 0)} pontos (arena ${user.arenaAtual || 1})`),
                        F.campo("Conquistas", formatNumber((user.conquistas && user.conquistas.length) || 0))
                    ] },
                    { emoji: "💀", titulo: `Chefes derrotados (${formatNumber(user.bossesMortos || 0)})`, linhas: linhasChefes },
                    { emoji: "💰", titulo: "Dinheiro", linhas: [
                        F.campo("Carteira", moedas(carteira)),
                        F.campo("Banco", moedas(banco)),
                        F.campo("Total", moedas(carteira + banco))
                    ] },
                    { emoji: "👤", titulo: "Identidade", linhas: [
                        F.campo("WhatsApp", podeVerPrivado ? phoneFormatted : "🔒 só a própria pessoa vê"),
                        user.name && user.name !== nick ? F.campo("Nome no WhatsApp", user.name) : null,
                        F.campo("Cargo no bot", cargoBot),
                        _cargoGrupo ? F.campo("Cargo no grupo", _cargoGrupo) : null,
                        F.campo("Reputação", plural(user.rep || 0, "ponto", "pontos")),
                        F.campo("Sequência", plural(user.streak || 0, "dia", "dias"))
                    ] },
                    { emoji: "📊", titulo: "Atividade", linhas: [
                        F.campo("Total", `${formatNumber(totalMensagens)} mensagens · ${formatNumber(totalCmds)} comandos`),
                        F.campo("Em grupos", `${formatNumber(farmGrupoMsgs)} mensagens · ${formatNumber(farmGrupoXp)} XP · nível ${user.levelGroup || user.level_group || 1}`),
                        F.campo("No privado", `${formatNumber(farmPvMsgs)} mensagens · ${formatNumber(farmPvXp)} XP · nível ${user.levelPv || user.level_pv || 1}`),
                        F.campo("Em combate", `${formatNumber(farmRpgXp)} XP · nível ${user.levelRpg || user.level_rpg || nivel}`)
                    ] },
                    { emoji: "📱", titulo: "Aparelho", linhas: [
                        F.campo("Modelo", (tele.device.declaradoPeloUsuario || /estimad/i.test(tele.device.model || ""))
                            ? tele.device.model
                            : tele.device.model + " (estimado)"),
                        nomePlat ? F.campo("Usando", `${nomePlat} (${isSelf ? "agora" : "último acesso"})`) : null,
                        (tele.pingMs !== null && tele.pingMs !== undefined)
                            ? F.campo("Atraso de entrega", tele.pingMs + " ms" + (user.netType ? " (" + user.netType + ")" : ""))
                            : F.campo("Atraso de entrega", "não deu para medir (relógio do aparelho fora de hora)")
                    ] },
                    { emoji: "🌐", titulo: `Grupos em comum comigo (${sharedGroups.length})`, linhas: podeVerPrivado
                        ? sharedGroups.slice(0, 8).map((g, idx) =>
                            `${idx + 1}. ${g.name}` + (g.link ? `\n   ${g.link}` : "")
                        ).concat(sharedGroups.length > 8 ? [`e mais ${sharedGroups.length - 8}`] : [])
                        : (sharedGroups.length ? ["_Os nomes dos grupos só aparecem na ficha da própria pessoa._"] : []) }
                ],
                dica: !tele.device.declaradoPeloUsuario && isSelf
                    ? `O WhatsApp não me diz o modelo do aparelho. Para mostrar o exato, use ${prefix}setdevice <modelo>.`
                    : "",
                proximos: isSelf ? [
                    { nome: "inv", oque: "abrir sua mochila" },
                    { nome: "banco", oque: "guardar moedas no banco" },
                    { nome: "login", args: "nome <novo nick>", oque: "trocar o nick" }
                ] : [
                    { nome: "dossie", oque: "ver a sua própria ficha" },
                    { nome: "perfil", oque: "ver seu perfil resumido" }
                ],
                prefix
            });

            return cartao.enviarComCartao({
                ctx: { client, from, info, reply },
                texto: doc,
                mentions: [targetJid, sender],
                gerar: async () => cartao.cartaoPerfil({
                    nome: nick,
                    subtitulo: _cargoGrupo ? `${cargoNome} · ${_cargoGrupo}` : cargoNome,
                    nivel,
                    rank: posicao ? `${posicao}º ${rotuloPosicao}` : cargoBot,
                    xpAtual: currentXp,
                    xpNecessario: maxXp,
                    foto: await cartao.fotoDePerfil(client, targetJid),
                    stats: [
                        ["Poder", rpgStats.cp],
                        ["Moedas", moedas(carteira + banco).replace(/ moedas?$/, "")],
                        ["Vitórias", user.wins || 0],
                        ["Chefes", user.bossesMortos || 0],
                        ["Mensagens", totalMensagens],
                        ["Sequência", plural(user.streak || 0, "dia", "dias")]
                    ],
                    rodape: rebirths ? `${rebirths} reencarnações` : "ficha da taverna"
                })
            });
        } catch (e) {
            logger.error("Erro ao executar comando .dossie:", e);
            return reply(F.tela({
                emoji: "❌",
                titulo: "Não consegui montar a ficha",
                intro: "Algo deu errado enquanto eu juntava os dados. Já anotei o problema.",
                dica: "Tente de novo em instantes. Se continuar, avise um dos donos.",
                proximos: [
                    { nome: "perfil", oque: "ver o perfil resumido" },
                    { nome: "dono", oque: "ver quem são os donos" }
                ],
                prefix
            }));
        }
}
