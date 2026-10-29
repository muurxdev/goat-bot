const { nomeDoMembro } = require('../../utils/nomeMembro');
const groupRemovalService = require("../../services/groupRemovalService");
const figurinhaEventoService = require("../../services/figurinhaEventoService");
const audioEventoService = require("../../services/audioEventoService");
const logger = require("../../core/logger");

function parseDuration(str) {
    const match = str.match(/^(\d+)\s*(m|h|d|min|hour|day|minuto|hora|dia)s?$/i);
    if (!match) return null;
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit === "m" || unit === "min" || unit === "minuto") return value * 60 * 1000;
    if (unit === "h" || unit === "hour" || unit === "hora") return value * 60 * 60 * 1000;
    if (unit === "d" || unit === "day" || unit === "dia") return value * 24 * 60 * 60 * 1000;
    return null;
}

function formatDuration(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(" ") || "0m";
}

module.exports = {
    name: "timeban",
    aliases: ["bantemp","bantemporario","tempban","cmd_timeban","alt_timeban","atalho_timeban","abrev_timeban","call_timeban","func_timeban"],
    category: "admin",
    subcategory: "Moderação",
    description: "Remove um participante do grupo temporariamente",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, args, reply, sender, client, info, quotedSender, prefix = "." }) => {
        const target = groupRemovalService.extrairAlvo({ info, args, quotedSender });

        if (!target) {
            return reply(`❓ Marque, responda ou digite o número de quem devo remover e por quanto tempo.\n\nExemplo: \`${prefix}timeban @pessoa 2h\` (vale \`30m\`, \`2h\` ou \`1d\`)`);
        }

        // A duração é o primeiro argumento que parece tempo — com menção ela vem
        // em args[1], respondendo a mensagem ela vem em args[0].
        const durationStr = args.find(a => parseDuration(String(a))) || "";
        const durationMs = parseDuration(durationStr);

        if (!durationMs || durationMs <= 0) {
            return reply("⚠️ Não entendi o tempo. Use, por exemplo, `30m`, `2h` ou `1d`.");
        }

        const senderNum = sender.split("@")[0].split(":")[0];

        try {
            const resultado = await groupRemovalService.removerMembro(client, from, target, { autor: sender, origem: "timeban" });
            if (!resultado.ok) {
                const alvo = resultado.apiJid || target;
                return reply(groupRemovalService.mensagemFalha(resultado.motivo, alvo), [alvo]);
            }

            const apiJid = resultado.apiJid;
            const targetNum = apiJid.split("@")[0].split(":")[0];
            await groupRemovalService.registrarBanTemporario(from, { jid: target, apiJid, durationMs, bannedBy: sender });

            logger.info(`[TIMEBAN] ${apiJid} banido por ${formatDuration(durationMs)} em ${from} por ${sender}`);

            let doc = `⏳ @${targetNum} foi removido do grupo por *${formatDuration(durationMs)}*, a pedido de ${nomeDoMembro(sender)}.\n\n`;
            doc += `Se voltar antes do prazo, sai de novo. Depois disso, pode ser adicionado normalmente.`;

            await reply(doc, [apiJid, sender]);
            await figurinhaEventoService.enviar(client, from, "banimento");
            await audioEventoService.enviar(client, from, "banimento");
        } catch (err) {
            logger.error("[TIMEBAN ERROR]", err);
            return reply("⚠️ Não consegui concluir o banimento temporário. Tente de novo em instantes.");
        }
    }
};
