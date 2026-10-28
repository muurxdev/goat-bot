/**
 * Comando .postardescricao — publica a descrição do grupo na conversa (só admins)
 */

const logger = require("../../core/logger");

module.exports = {
    name: "postardescricao",
    aliases: ["postardesc", "anunciardescricao"],
    category: "admin",
    description: "Publica a descrição do grupo na conversa, para todos verem",
    examples: [" — publica a descrição deste grupo"],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 5000,
    execute: async ({ client, from, reply }) => {
        try {
            const meta = await client.groupMetadata(from);
            const desc = String(meta.desc || "").trim();
            if (!desc) {
                return reply("📝 Este grupo ainda não tem descrição para publicar. Defina com `.setdesc <texto>`.");
            }
            return reply(`📌 *${meta.subject || "Grupo"}*\n\n${desc}`);
        } catch (err) {
            logger.warn(`[POSTARDESCRICAO] Falha ao publicar a descrição de ${from}: ${err.message}`);
            return reply("❌ Não consegui publicar a descrição agora.");
        }
    }
};
