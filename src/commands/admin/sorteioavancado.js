/**
 * Comando .sorteioavancado / .sorteiomembros
 * Realiza sorteios inteligentes no grupo filtrando apenas não-admins ou membros comuns
 */

const logger = require('../../core/logger')
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "sorteioavancado",
    aliases: ["sorteiomembros","sorteiomembro","sorteiofiltro","cmd_sorteioavancado","alt_sorteioavancado","atalho_sorteioavancado","abrev_sorteioavancado","call_sorteioavancado","func_sorteioavancado"],
    category: "admin",
    description: "Sorteia participantes com filtros especiais (apenas membros comuns)",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, reply, text }) => {
        const botName = getBotName();
        const reason = (text || "Prêmio Especial do Grupo").trim();

        let meta;
        try {
            meta = await client.groupMetadata(from);
        } catch (errIgnorado) { logger.warn(`[SORTEIOAVANCADO] Falha ignorada em src/commands/admin/sorteioavancado.js:23: ${errIgnorado.message}`) }

        const participants = meta?.participants || [];
        const nonAdmins = participants.filter(p => !p.admin);
        const pool = nonAdmins.length > 0 ? nonAdmins : participants;

        if (pool.length === 0) return reply("❌ Nenhum participante elegível encontrado.");

        const winner = pool[Math.floor(Math.random() * pool.length)];
        const winnerJid = winner.id || winner.jid || String(winner);
        const winnerNum = winnerJid.split("@")[0].split(":")[0];

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🎉 *SORTEIO EXCLUSIVO* 🎉   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🎁 *Motivo:* ${reason}\n\n`;
        doc += `╭━〔 👑 GANHADOR(A) SELECIONADO(A) 〕━⬣\n`;
        doc += `┃ 🏆 *Vencedor:* @${winnerNum}\n`;
        doc += `┃ 👥 *Concorrentes:* ${pool.length} participantes\n`;
        doc += `┃ 🛡️ *Filtro:* Membros Comuns (Não-Admins)\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `✨ _Parabéns @${winnerNum}! Entre em contato com os administradores._\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [winnerJid]);
    }
};

