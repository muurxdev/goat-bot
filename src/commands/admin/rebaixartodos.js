/**
 * Comando .rebaixartodos / .demoteall
 * Rebaixa administradores do grupo em lote de forma segura
 *
 * Exclui da lista o próprio bot e quem pediu. A comparação antiga olhava só os
 * dígitos do número do bot; em grupo LID o bot aparece como "<lid>@lid", passava
 * no filtro e se rebaixava junto — perdendo o admin no meio da operação.
 */

const logger = require("../../core/logger");
const groupAuthService = require("../../services/groupAuthService");

/** Todas as formas pelas quais um participante pode aparecer no metadata. */
function idsDe(p) {
    if (typeof p === "string") return [p];
    return [p?.id, p?.jid, p?.lid, p?.phoneNumber].filter(x => typeof x === "string" && x);
}

module.exports = {
    name: "rebaixartodos",
    aliases: ["demoteall","tiraradmtodos","rebaixar-todos","cmd_rebaixartodos","alt_rebaixartodos","atalho_rebaixartodos","abrev_rebaixartodos","call_rebaixartodos","func_rebaixartodos"],
    category: "admin",
    description: "Rebaixa os outros administradores a membro comum, até 10 por vez",
    examples: [" — rebaixa até 10 administradores, menos você e eu"],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 5000,
    execute: async ({ client, from, reply, sender, senderReal, prefix = "." }) => {
        let meta;
        try {
            meta = await client.groupMetadata(from);
        } catch (err) {
            logger.warn(`[REBAIXARTODOS] Sem metadata de ${from}: ${err.message}`);
            return reply("❌ Não consegui ler a lista de participantes agora. Tente de novo em instantes.");
        }

        const ehBot = p => idsDe(p).some(j => groupAuthService.isBotJid(j, client));
        const ehQuemPediu = p => idsDe(p).some(j =>
            groupAuthService.sameUser(j, sender) || (senderReal && groupAuthService.sameUser(j, senderReal)));

        const admins = (meta?.participants || []).filter(p => p.admin && !ehBot(p) && !ehQuemPediu(p));

        if (admins.length === 0) return reply("⚠️ Não há outros administradores para rebaixar. Você e eu ficamos de fora da lista de propósito.");

        // A API espera o identificador principal do participante (id), que em grupo LID é o @lid.
        const jids = admins.map(p => (typeof p === "string" ? p : (p.id || p.jid)));
        const lote = jids.slice(0, 10);
        await reply(`⏳ Rebaixando *${lote.length}* administrador${lote.length === 1 ? "" : "es"}...`);

        try {
            await client.groupParticipantsUpdate(from, lote, "demote");
            let msg = `✅ *Administradores rebaixados*\n\n${lote.length} administrador${lote.length === 1 ? " voltou" : "es voltaram"} a ser membro comum. Você e eu mantivemos o cargo.`;
            if (jids.length > lote.length) msg += `\n\n💡 _Faço no máximo 10 por vez. Restam ${jids.length - lote.length}: rode o comando de novo._`;
            msg += `\n\n👉 *Próximos passos*\n• \`${prefix}admins\` — confere quem ainda administra`;
            return reply(msg);
        } catch (err) {
            logger.error(`[REBAIXARTODOS] Falha ao rebaixar em ${from}:`, err);
            return reply("❌ Não consegui rebaixar os administradores. O WhatsApp recusou o pedido; confira se eu ainda sou administrador e tente de novo.");
        }
    }
};
