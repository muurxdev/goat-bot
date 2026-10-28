/**
 * Comando .descricao — mostra a descrição atual do grupo
 */

const logger = require("../../core/logger");

module.exports = {
    name: "descricao",
    aliases: ["descricaogrupo", "verdescricao"],
    category: "admin",
    description: "Mostra a descrição atual do grupo",
    examples: [" — mostra a descrição deste grupo"],
    groupOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, reply }) => {
        try {
            const meta = await client.groupMetadata(from);
            const desc = String(meta.desc || "").trim();
            if (!desc) {
                return reply("📝 Este grupo ainda não tem descrição. Admins podem definir com `.setdesc <texto>`.");
            }
            return reply(`📝 *Descrição de ${meta.subject || "este grupo"}*\n\n${desc}`);
        } catch (err) {
            logger.warn(`[DESCRICAO] Falha ao ler a descrição de ${from}: ${err.message}`);
            return reply("❌ Não consegui ler a descrição deste grupo agora.");
        }
    }
};
