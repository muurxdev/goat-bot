/**
 * Comando .hidetag / .marcar / .ghosttag
 * Marca todos os participantes do grupo de forma oculta/fantasma
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "hidetag",
    aliases: ["marcar","ghosttag","marcafantasma","notificartodos","cmd_hidetag","alt_hidetag","atalho_hidetag","abrev_hidetag","call_hidetag","func_hidetag"],
    category: "admin",
    subcategory: "Moderação",
    description: "Manda um aviso que notifica todos do grupo sem mostrar a lista de marcados",
    usage: "[texto]",
    examples: ["Reunião agora no grupo — notifica todos com seu aviso", " — respondendo a uma mensagem, repete o texto dela notificando todos"],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, text, quotedText, reply, info }) => {
        let meta;
        try {
            meta = await client.groupMetadata(from);
        } catch (e) {
            logger.warn(`[HIDETAG] Falha ao carregar metadados do grupo ${from}: ${e.message}`);
        }

        const participants = meta?.participants || [];
        if (participants.length === 0) return reply("❌ Não consegui ver quem está no grupo agora, então não marquei ninguém. Tente de novo em instantes.");

        const msg = (text || quotedText || "📢 Notificação importante para todos os participantes!").trim();
        const jids = participants.map(p => p.id || p.jid || String(p));

        return client.sendMessage(from, { text: msg, mentions: jids }, { quoted: info });
    }
};
