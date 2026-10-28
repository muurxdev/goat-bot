/**
 * Comando .deldono / .delcargo / .delowner / .removerdono / .removercargo
 * Remove ou desativa um Dono da hierarquia militar seguindo autorização rígida:
 * • Suporta: Menção (@user), Resposta à mensagem (quoted), Telefone, Patente ou Nick do bot
 * • Resolução profunda do perfil do usuário: Nome cadastrado no bot via .login (displayNick), WhatsApp pushName e nome no cargo
 * • Marcação ativa no WhatsApp (@user)
 * • Limpeza completa no SQLite (ownerService, user_roles, trust_list)
 */

const {
    getOwners,
    findOwnerByQuery,
    canModifyOwner,
    demoteOwnerComplete,
    resolveOwnerProfileDetails,
    resolveOwnerName,
    getOwnerRank
} = require("../../services/ownerService");
const groupAuthService = require("../../services/groupAuthService");
const { formatPhoneFromJid } = require("../../config/env");
const F = require("../../utils/formato");
const logger = require("../../core/logger");

module.exports = {
    name: "deldono",
    aliases: [
        "delowner",
        "removerdono",
        "rebaixardono",
        "removedono",
        "tirardono",
        "delcargo",
        "removercargo",
        "tirarcargo",
        "desnomeardono"
    ],
    category: "owner",
    subcategory: "Gestão do Bot",
    description: "Tira alguém da hierarquia de donos ou remove um cargo, mostrando o perfil da pessoa",
    usage: "<@pessoa | patente | número | apelido>",
    examples: [
        "@pessoa — remove o dono marcado",
        "sargento — desocupa a patente de Sargento",
        "5511999999999 — procura o dono pelo número",
        " — responda a mensagem do dono com o comando para removê-lo"
    ],
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({
        args,
        reply,
        sender,
        senderReal,
        roleJid,
        mentionedJid,
        info,
        from,
        isGroup,
        client,
        prefix = "."
    }) => {
        const candidates = [roleJid, senderReal, sender].filter(Boolean);
        const senderRank = getOwnerRank(sender, candidates);

        // 1. Validação de Autoridade do Remetente
        if (!senderRank || senderRank.level < 4) {
            return reply(F.tela({
                emoji: "⛔",
                titulo: "Só Capitão e Tenente",
                intro: "Remover donos ou revogar cargos é tarefa do *Capitão* e do *Tenente*. Sua patente não permite essa mudança.",
                proximos: [{ nome: "dono", oque: "ver quem ocupa cada patente" }],
                prefix
            }));
        }

        // 2. Extração do Alvo (Menção @, Resposta ou Texto)
        let targetRaw = null;

        if (Array.isArray(mentionedJid) && mentionedJid.length > 0) {
            targetRaw = mentionedJid[0];
        } else if (info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetRaw = info.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (info?.message?.extendedTextMessage?.contextInfo?.participant) {
            targetRaw = info.message.extendedTextMessage.contextInfo.participant;
        } else if (args.length > 0) {
            targetRaw = args.join(" ").trim();
        }

        // 3. Guia de Ajuda caso nenhum alvo seja especificado
        if (!targetRaw) {
            const owners = getOwners();
            const activeOwners = owners.filter(o => o.active);

            const donos = activeOwners.map(o => {
                const title = o.customTitle ? `${o.customTitle} (${o.rank})` : o.rank;
                const liveNick = resolveOwnerName(o);
                return `🎖️ *${title}:* ${liveNick || "Dono"}${o.phone ? ` (${o.phone})` : ""}`;
            });

            return reply(F.tela({
                emoji: "👑",
                titulo: "Remover dono ou cargo",
                intro: "Diga quem sai da hierarquia de donos. A patente fica vaga e a pessoa perde as permissões de dono.",
                secoes: [
                    { emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "deldono", "@pessoa")} — marca o dono`,
                        `• Responda a mensagem do dono com ${F.cmd(prefix, "deldono")}`,
                        `• ${F.cmd(prefix, "deldono", "sargento")} — pela patente`,
                        `• ${F.cmd(prefix, "deldono", "5511999999999")} — pelo número`,
                        `• ${F.cmd(prefix, "deldono", "GOAT")} — pelo apelido cadastrado comigo`
                    ] },
                    { emoji: "🛡️", titulo: "Quem pode remover quem", linhas: [
                        "• 👑 *Capitão:* remove qualquer patente.",
                        "• 🎖️ *Tenente:* remove só as patentes abaixo dele (Sargento, Cabo, Soldado...).",
                        "• 🚫 Ninguém remove o Capitão."
                    ] },
                    { emoji: "📋", titulo: "Donos ativos", linhas: donos.length ? donos : ["Nenhuma patente ocupada no momento."] }
                ],
                proximos: [{ nome: "dono", oque: "ver a hierarquia completa" }],
                prefix
            }));
        }

        // 4. Localização do Alvo na Hierarquia Militar
        let targetOwner = null;
        let resolvedJid = null;

        if (targetRaw.includes("@")) {
            try {
                if (groupAuthService && typeof groupAuthService.resolveRealJid === "function") {
                    resolvedJid = await groupAuthService.resolveRealJid(client, targetRaw);
                }
            } catch (err) {
                logger.warn("[DELDONO] não consegui resolver o número real do alvo", { targetRaw, erro: err?.message });
            }
            targetOwner = findOwnerByQuery(targetRaw, [targetRaw, resolvedJid]);
            if (!targetOwner && resolvedJid) {
                targetOwner = findOwnerByQuery(resolvedJid, [targetRaw, resolvedJid]);
            }
        } else {
            targetOwner = findOwnerByQuery(targetRaw);
        }

        // 5. Tratamento de Alvo Não Encontrado
        if (!targetOwner) {
            // Caso seja no grupo e o comando foi invocado como delcargo/removercargo, checa cargo de grupo
            if (isGroup && (targetRaw.includes("@") || resolvedJid)) {
                const targetUserJid = resolvedJid || targetRaw;
                try {
                    const userRepo = require("../../database/repositories/userRepository");
                    const userDb = userRepo.getUser(targetUserJid);
                    if (userDb && userDb.cargos && userDb.cargos[from]) {
                        const oldCargo = userDb.cargos[from];
                        delete userDb.cargos[from];
                        userRepo.saveUser(userDb);
                        const targetDigits = targetUserJid.split("@")[0].replace(/\D/g, "");
                        const senderDigits = sender.split("@")[0].replace(/\D/g, "");
                        return reply(F.tela({
                            emoji: "✅",
                            titulo: "Cargo do grupo removido",
                            intro: `@${targetDigits} não tem mais o cargo *${oldCargo}* neste grupo.`,
                            secoes: [{ emoji: "📋", titulo: "Registro", linhas: [
                                F.campo("Pessoa", `@${targetDigits} (${userDb.displayNick || userDb.name || "Membro"})`),
                                F.campo("Cargo removido", oldCargo),
                                F.campo("Removido por", `@${senderDigits}`)
                            ] }]
                        }), [targetUserJid, sender]);
                    }
                } catch (err) {
                    logger.warn("[DELDONO] falha ao remover cargo de grupo", { targetUserJid, from, erro: err?.message });
                }
            }

            const alvoLegivel = targetRaw.includes("@") ? `@${targetRaw.split("@")[0]}` : targetRaw;
            return reply(F.tela({
                emoji: "❌",
                titulo: "Não achei esse dono",
                intro: `"${alvoLegivel}" não ocupa nenhuma patente na minha hierarquia de donos.`,
                dica: "Confira a lista e tente de novo marcando a pessoa ou usando o nome da patente.",
                proximos: [
                    { nome: "dono", oque: "ver quem ocupa cada patente" },
                    { nome: "deldono", args: "sargento", oque: "remover pela patente" }
                ],
                prefix
            }));
        }

        // 6. Verificação de Slot Já Desocupado
        if (!targetOwner.active) {
            return reply(F.tela({
                emoji: "ℹ️",
                titulo: "Essa patente já está vaga",
                intro: `Ninguém ocupa a patente *${targetOwner.rank}* agora, então não há o que remover.`,
                proximos: [{ nome: "setdono", args: `${targetOwner.rank.toLowerCase()} @pessoa`, oque: "nomear alguém para ela" }],
                prefix
            }));
        }

        // 7. Validação Rígida da Hierarquia Militar
        const check = canModifyOwner(sender, targetOwner, candidates, { remocao: true });
        if (!check.allowed) {
            return reply(check.reason);
        }

        // 8. Resolução Profunda do Perfil do Alvo no Bot (SQLite + WhatsApp)
        const profile = resolveOwnerProfileDetails(targetOwner, [targetRaw, resolvedJid].filter(Boolean));
        const targetJid = profile.jid || targetOwner.jid || (targetRaw.includes("@") ? targetRaw : null);

        // 9. Execução da Desvinculação Completa (Hierarquia + Permissões)
        const removed = demoteOwnerComplete(targetOwner, senderRank, sender);
        if (!removed) {
            logger.warn("[DELDONO] demoteOwnerComplete não removeu a patente", { rank: targetOwner.rank, sender });
            return reply(F.tela({
                emoji: "❌",
                titulo: "Não consegui desocupar a patente",
                intro: `A patente *${targetOwner.rank}* continua ocupada. Tente de novo em instantes.`,
                proximos: [{ nome: "dono", oque: "conferir a hierarquia" }],
                prefix
            }));
        }

        // 10. Limpeza adicional no perfil do usuário no SQLite
        if (targetJid) {
            try {
                const userRepo = require("../../database/repositories/userRepository");
                const u = userRepo.getUser(targetJid);
                if (u && u.cargos && typeof u.cargos === "object") {
                    delete u.cargos["global"];
                    delete u.cargos["owner"];
                    userRepo.saveUser(u);
                }
            } catch (err) {
                logger.warn("[DELDONO] falha ao limpar cargos do perfil", { targetJid, erro: err?.message });
            }
        }

        // 11. Formatação Visual da Resposta com Menção Ativa (@user) e Detalhes Reais
        const targetDigits = (targetJid || "").replace(/\D/g, "");
        const targetTag = targetDigits ? `@${targetDigits}` : `@${(profile.phone || "").replace(/\D/g, "") || "membro"}`;
        const senderDigits = (sender || "").replace(/\D/g, "");
        const senderTag = senderDigits ? `@${senderDigits}` : `@${(senderRank.phone || "").replace(/\D/g, "") || "comandante"}`;

        const phoneFormatted = profile.phone || (targetJid ? formatPhoneFromJid(targetJid) : "Não informado");
        const displayNickFormatted = profile.displayNick ? `*${profile.displayNick}*` : `_(não cadastrado com ${prefix}login)_`;
        const pushNameFormatted = profile.pushName || "Desconhecido";
        const ownerNameFormatted = profile.ownerName || targetOwner.name || "Não registrado";
        const customTitleFormatted = removed.customTitle || removed.rank;
        const appointedByFormatted = removed.appointedBy || "Comando Superior";
        const senderRankTitle = senderRank.customTitle ? `${senderRank.customTitle} (${senderRank.rank})` : senderRank.rank;

        const mentions = [];
        if (targetJid) mentions.push(targetJid);
        if (sender) mentions.push(sender);

        // O título em maiúsculas é conferido por tests/owner-demote.test.js.
        const res = F.tela({
            emoji: "👑",
            titulo: "CARGO DE DONO REVOGADO",
            intro: `${targetTag} saiu da patente *${removed.rank}* e perdeu as permissões de dono. A vaga está livre.`,
            secoes: [
                { emoji: "👤", titulo: "Quem saiu", linhas: [
                    F.campo("Pessoa", targetTag),
                    F.campo("Apelido comigo", displayNickFormatted),
                    F.campo("Nome no WhatsApp", pushNameFormatted),
                    F.campo("Nome no cargo", ownerNameFormatted),
                    F.campo("Número", phoneFormatted)
                ] },
                { emoji: "🎖️", titulo: "Patente revogada", linhas: [
                    F.campo("Patente", `${removed.rank} (nível ${removed.level})`),
                    F.campo("Título", customTitleFormatted),
                    F.campo("Nomeado por", appointedByFormatted),
                    F.campo("Revogado por", `${senderTag} (${senderRankTitle})`),
                    F.campo("Data", F.data(new Date()))
                ] }
            ],
            proximos: [{ nome: "setdono", args: `${removed.rank.toLowerCase()} @pessoa`, oque: `nomear um novo ${removed.rank}` }],
            prefix
        });

        return reply(res, mentions);
    }
};
