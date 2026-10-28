/**
 * Comando .promovertodos / .promoteall
 * Promove participantes em lote com intervalo seguro anti-ban
 */

const F = require("../../utils/formato");
const logger = require("../../core/logger");

module.exports = {
    name: "promovertodos",
    aliases: ["promoteall","daradmtodos","promover-todos","cmd_promovertodos","alt_promovertodos","atalho_promovertodos","abrev_promovertodos","call_promovertodos","func_promovertodos"],
    category: "admin",
    description: "Promove membros comuns a administradores, até 10 por vez",
    examples: [" — promove até 10 membros comuns de uma vez"],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 5000,
    execute: async ({ client, from, reply, prefix = "." }) => {
        let meta;
        try {
            meta = await client.groupMetadata(from);
        } catch (err) {
            logger.warn(`[PROMOVERTODOS] Sem metadata de ${from}: ${err.message}`);
            return reply("❌ Não consegui ver quem está no grupo agora. Tente de novo em instantes.");
        }

        const nonAdmins = (meta?.participants || []).filter(p => !p.admin);
        if (nonAdmins.length === 0) return reply("⚠️ Todos os membros já são administradores. Não há ninguém para promover.");

        const jids = nonAdmins.map(p => p.id || p.jid || String(p));
        const lote = jids.slice(0, 10);
        await reply(`⏳ Promovendo *${lote.length}* membro${lote.length === 1 ? "" : "s"} a administrador...`);

        try {
            await client.groupParticipantsUpdate(from, lote, "promote");
            const restam = jids.length - lote.length;
            return reply(F.tela({
                emoji: "✅", titulo: "Membros promovidos", prefix,
                intro: `${lote.length} membro${lote.length === 1 ? " virou" : "s viraram"} administrador${lote.length === 1 ? "" : "es"} do grupo.`,
                dica: restam > 0 ? `Faço no máximo 10 por vez para o WhatsApp não bloquear. Restam ${restam}: rode o comando de novo.` : "",
                proximos: [
                    { nome: "admins", oque: "confere a lista de administradores" },
                    { nome: "rebaixartodos", oque: "desfaz, rebaixando os administradores" }
                ]
            }));
        } catch (err) {
            logger.error(`[PROMOVERTODOS] Falha ao promover em ${from}:`, err);
            return reply("❌ Não consegui promover os membros. O WhatsApp recusou o pedido; confira se eu ainda sou administrador e tente de novo.");
        }
    }
};

