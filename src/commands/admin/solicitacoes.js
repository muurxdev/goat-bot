/**
 * Comando .solicitacoes / .aceitar / .rejeitar
 * Gerenciamento seguro de solicitações de entrada no grupo com throttling anti-ban
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");
const groupAuthService = require("../../services/groupAuthService");

/** Dígitos do usuário de um JID, sem domínio nem sufixo de dispositivo. */
const digitosDe = j => String(j || "").split("@")[0].split(":")[0].replace(/\D/g, "");

module.exports = {
    name: "solicitacoes",
    aliases: ["joinrequests","pedidos","pendentes","aceitar","aprovar","rejeitar","recusar","cmd_solicitacoes","alt_solicitacoes","atalho_solicitacoes","abrev_solicitacoes","call_solicitacoes","func_solicitacoes"],
    category: "admin",
    description: "Lista, aceita ou recusa os pedidos de entrada no grupo",
    usage: "[aceitar|rejeitar todos|@pessoa]",
    examples: [" — lista os pedidos de entrada", "aceitar todos — aceita todos os pedidos"],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, sender, reply, args, commandName, isOwner, isAdmin, info, mentionedJid: mencionados = [] }) => {
        const botName = getBotName();
        const cmd = (commandName || "solicitacoes").toLowerCase();
        const sub = (args[0] || "").toLowerCase();

        // 1. Obter lista de solicitações pendentes via Baileys
        let requests = [];
        try {
            if (typeof client.groupRequestParticipantsList === "function") {
                requests = await client.groupRequestParticipantsList(from) || [];
            } else {
                return reply("❌ Ainda não consigo ver os pedidos de entrada por aqui. Aceite pelo próprio WhatsApp, nas informações do grupo.");
            }
        } catch (err) {
            logger.error("[SOLICITACOES ERROR]", err);
            return reply("❌ Não consegui ver os pedidos de entrada agora.\n\n💡 Confira se a aprovação de entrada está ligada no grupo e se eu sou administrador, e tente de novo.");
        }

        const isActionAccept = ["aceitar", "aprovar"].includes(cmd) || ["aceitar", "aprovar", "sim"].includes(sub);
        const isActionReject = ["rejeitar", "recusar"].includes(cmd) || ["rejeitar", "recusar", "nao"].includes(sub);

        // CASO A: LISTAR SOLICITAÇÕES
        if (!isActionAccept && !isActionReject && (!sub || sub === "list" || sub === "listar" || sub === "ver")) {
            if (requests.length === 0) {
                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   📋 *SOLICITAÇÕES DE ENTRADA* 📋   ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `✅ *Nenhuma solicitação pendente no momento.*\n\n`;
                doc += `💡 _Quando novos membros solicitarem entrada com a aprovação ligada, eles aparecerão aqui._\n`;
                doc += `👑 *${botName}*`;
                return reply(doc.trim());
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📋 *SOLICITAÇÕES PENDENTES* 📋   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📊 *Total de Pedidos:* ${requests.length} participante(s)\n\n`;
            doc += `╭━〔 👥 USUÁRIOS AGUARDANDO 〕━⬣\n`;

            const mentions = [];
            requests.slice(0, 25).forEach((req, i) => {
                const jid = req.jid || req.id || String(req);
                const num = jid.split("@")[0].split(":")[0];
                mentions.push(jid);
                doc += `┃ ${i + 1}. @${num}\n`;
                if (req.request_time) {
                    const dateStr = new Date(Number(req.request_time) * 1000).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
                    doc += `┃    └ ⏱️ _Pedido feito às ${dateStr}_\n`;
                }
            });

            if (requests.length > 25) {
                doc += `┃ ... e mais ${requests.length - 25} usuário(s)\n`;
            }
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `📌 *Ações Rápidas:*\n`;
            doc += `• \`.aceitar todos\` — Aceitar todos com intervalo seguro anti-ban (5 a 10s)\n`;
            doc += `• \`.aceitar @usuario\` — Aceitar participante específico\n`;
            doc += `• \`.rejeitar todos\` — Rejeitar todos os pedidos\n`;
            doc += `• \`.rejeitar @usuario\` — Rejeitar participante específico\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), mentions);
        }

        // Determina a ação ('approve' ou 'reject')
        const actionType = isActionAccept ? "approve" : "reject";
        const actionLabel = isActionAccept ? "Aprovado(s)" : "Rejeitado(s)";
        const actionVerb = isActionAccept ? "Aprovando" : "Rejeitando";

        // CASO B: PROCESSAR TODOS OS PEDIDOS (COM INTERVALO SEGURO / THROTTLING ANTI-BAN)
        const isAll = (args[0]?.toLowerCase() === "todos" || args[0]?.toLowerCase() === "all" || args[1]?.toLowerCase() === "todos" || args[1]?.toLowerCase() === "all");

        if (isAll) {
            if (requests.length === 0) {
                return reply(`⚠️ Não há solicitações pendentes para ${actionType === "approve" ? "aprovar" : "rejeitar"}.`);
            }

            // Intervalo customizável em segundos (padrão: 5s por participante para segurança)
            let delaySec = 5;
            const parsedDelay = parseInt(args.find(a => /^\d+s?$/i.test(a)));
            if (parsedDelay && parsedDelay >= 2 && parsedDelay <= 30) {
                delaySec = parsedDelay;
            }

            const total = requests.length;
            const totalEstimatedSec = total * delaySec;

            let startMsg = `╔══════════════════════════════╗\n`;
            startMsg += `║   🛡️ *PROCESSANDO SOLICITAÇÕES* 🛡️   ║\n`;
            startMsg += `╚══════════════════════════════╝\n\n`;
            startMsg += `⏳ *${actionVerb} ${total} participante(s) em lote...*\n`;
            startMsg += `⏱️ *Intervalo de Segurança:* ${delaySec}s por usuário (Anti-Ban)\n`;
            startMsg += `⏳ *Tempo Estimado:* ~${totalEstimatedSec} segundos\n\n`;
            startMsg += `💡 _Vou aceitando aos poucos, com intervalo, para o WhatsApp não bloquear._\n`;
            startMsg += `👑 *${botName}*`;

            await reply(startMsg.trim());

            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < requests.length; i++) {
                const req = requests[i];
                const jid = req.jid || req.id || String(req);

                try {
                    await client.groupRequestParticipantsUpdate(from, [jid], actionType);
                    successCount++;
                } catch (procErr) {
                    logger.warn(`[GROUP_REQUEST_UPDATE WARN] Falha ao processar ${jid}: ${procErr.message}`);
                    failCount++;
                }

                // Aguarda o intervalo de segurança entre cada aprovação (exceto no último)
                if (i < requests.length - 1) {
                    await new Promise(r => setTimeout(r, delaySec * 1000));
                }
            }

            let endDoc = `╔══════════════════════════════╗\n`;
            endDoc += `║   ✅ *PROCESSO FINALIZADO* ✅   ║\n`;
            endDoc += `╚══════════════════════════════╝\n\n`;
            endDoc += `╭━〔 📊 RESULTADO DO LOTE 〕━⬣\n`;
            endDoc += `┃ 👥 *Total Processado:* ${total}\n`;
            endDoc += `┃ 🟢 *${actionLabel} com Sucesso:* ${successCount}\n`;
            if (failCount > 0) {
                endDoc += `┃ 🔴 *Falhas:* ${failCount}\n`;
            }
            endDoc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            endDoc += `👑 *${botName}*`;

            return reply(endDoc.trim());
        }

        // CASO C: PROCESSAR USUÁRIO ESPECÍFICO (POR MENÇÃO OU NÚMERO)
        // info e mentionedJid não eram desestruturados do contexto: .aceitar @user
        // e .aceitar <número> lançavam "info is not defined".
        const contextInfo = info?.message?.extendedTextMessage?.contextInfo;
        const mentionedJid = mencionados[0] || contextInfo?.mentionedJid?.[0];
        let targetJid = mentionedJid;

        if (!targetJid) {
            const rawTarget = args.find(a => !["aceitar", "aprovar", "rejeitar", "recusar", "todos", "all"].includes(a.toLowerCase()));
            if (rawTarget) {
                const cleanNum = rawTarget.replace(/[^0-9]/g, "");
                if (cleanNum.length >= 8) {
                    targetJid = `${cleanNum}@s.whatsapp.net`;
                }
            }
        }

        if (!targetJid) {
            return reply(
                `❌ *Informe quem deseja ${actionType === "approve" ? "aceitar" : "rejeitar"}!*\n\n` +
                `📌 *Exemplos:*\n` +
                `• \`.${cmd} todos\` — Processar todas as solicitações\n` +
                `• \`.${cmd} @usuario\` — Processar o usuário mencionado\n` +
                `• \`.${cmd} 5511999999999\` — Processar por número de telefone`
            );
        }

        // Procura o pedido por qualquer identificador que ele traga. Em grupo LID o
        // pedido vem como "<lid>@lid" (às vezes com o telefone em phone_number), e
        // um JID montado com o número não existe na lista — mandar esse JID para a
        // API falhava. Sem pedido correspondente, diz isso em vez de tentar.
        const alvoDigitos = digitosDe(targetJid);
        const found = requests.find(r => {
            const ids = typeof r === "string" ? [r] : [r.jid, r.id, r.lid, r.phone_number, r.phoneNumber].filter(Boolean);
            return ids.some(x => groupAuthService.sameUser(String(x), targetJid) || (alvoDigitos && digitosDe(x) === alvoDigitos));
        });
        if (!found) {
            return reply(`⚠️ Não encontrei solicitação pendente de @${alvoDigitos || "usuário"} neste grupo.\n\n📋 Veja a lista com \`.solicitacoes\`.`, targetJid ? [targetJid] : []);
        }
        const finalJid = typeof found === "string" ? found : (found.jid || found.id);

        try {
            await client.groupRequestParticipantsUpdate(from, [finalJid], actionType);
            const userNum = finalJid.split("@")[0].split(":")[0];
            return reply(`✅ *Participante @${userNum} ${actionLabel.toLowerCase()} com sucesso!*`, [finalJid]);
        } catch (err) {
            logger.error("[GROUP REQUEST SINGLE ERROR]", err);
            return reply(`❌ Não consegui ${actionType === "approve" ? "aceitar" : "recusar"} esse pedido. Ele pode já ter sido resolvido; confira com \`.solicitacoes\` e tente de novo.`);
        }
    }
};

