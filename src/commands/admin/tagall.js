/**
 * Comando .tagall / .todos / .marcartodos
 * Marca todos os participantes do grupo com layout formatado e menções reais
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "tagall",
    aliases: ["todos","marcartodos","marcar-todos","tag-all","marcatodos","cmd_tagall","alt_tagall","atalho_tagall","abrev_tagall","call_tagall","func_tagall"],
    category: "admin",
    subcategory: "Moderação",
    description: "Menciona todos os membros do grupo com destaque sem poluir o chat com listas",
    usage: "[aviso]",
    examples: [" — convoca todos com o aviso padrão", "Reunião às 20h — convoca todos com seu aviso"],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 4000,
    execute: async ({ client, from, text, quotedText, reply, sender, info }) => {
        const botName = getBotName();
        let meta;
        try {
            meta = await client.groupMetadata(from);
        } catch (e) {
            logger.warn(`[TAGALL] Falha ao carregar metadados do grupo ${from}: ${e.message}`);
        }

        const participants = meta?.participants || [];
        if (participants.length === 0) return reply("❌ Não foi possível carregar os participantes do grupo.");

        const msg = (text || quotedText || "📢 Atenção a todos os membros do grupo!").trim();
        const jids = participants.map(p => p.id || p.jid || String(p));
        const senderNum = sender.split("@")[0].split(":")[0];

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📢 *CONVOCAÇÃO GERAL* 📢   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `💬 *Aviso:* ${msg}\n\n`;
        doc += `👤 *Convocado por:* @${senderNum}\n`;
        doc += `👥 *Membros Notificados:* ${participants.length}\n\n`;
        doc += `👑 *${botName}*`;

        return client.sendMessage(from, {
            text: doc.trim(),
            mentions: jids
        }, { quoted: info });
    }
};
