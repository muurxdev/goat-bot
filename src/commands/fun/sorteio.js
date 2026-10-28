/**
 * Comando .sorteio
 * Sorteia aleatoriamente um ou mais membros do grupo
 */
const F = require("../../utils/formato");
const logger = require("../../core/logger");

module.exports = {
    name: "sorteio",
    aliases: ["sortear", "escolhermembro", "roletasorte"],
    category: "fun",
    description: "Sorteia aleatoriamente um membro participante do grupo",
    usage: "[motivo]",
    examples: [" — sorteia um membro", "quem paga o café — sorteia com um motivo"],
    subcategory: "Diversão",
    groupOnly: true,
    execute: async ({ client, from, text, reply, prefix = "." }) => {
        try {
            const meta = await client.groupMetadata(from);
            const participants = meta.participants || [];

            if (participants.length === 0) {
                return reply("🎉 Não encontrei ninguém neste grupo para sortear. Tente de novo em instantes.");
            }

            const chosen = participants[Math.floor(Math.random() * participants.length)];
            const chosenJid = chosen.id || chosen.jid;
            const chosenNum = chosenJid.split("@")[0].split(":")[0];
            const motivo = (text && text.trim()) || "Sorteio Geral da Comunidade";

            const doc = F.tela({
                emoji: "🎉",
                titulo: "Sorteio do grupo",
                intro: `🏆 Quem ganhou foi 👑 @${chosenNum}!`,
                secoes: [{ emoji: "📜", titulo: "Detalhes", linhas: [
                    F.campo("Motivo", motivo),
                    F.campo("Concorrentes", `${participants.length} membros`)
                ] }],
                dica: "Diga o motivo junto do comando para ele aparecer no resultado.",
                proximos: [
                    { nome: "sorteio", args: "quem paga o café", oque: "sortear com um motivo" }
                ],
                prefix
            });

            await client.sendMessage(from, {
                text: doc.trim(),
                mentions: [chosenJid]
            });
        } catch (err) {
            logger.error(`[SORTEIO] Falha ao sortear no grupo ${from}: ${err && err.message}`);
            return reply("🎉 Não consegui ver a lista de membros para sortear agora. Tente de novo em instantes.");
        }
    }
};

