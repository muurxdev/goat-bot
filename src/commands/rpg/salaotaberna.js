/**
 * Comando .salaotaberna / .vestiario
 * Descanso no Vestiário dos Campeões com recuperação de energia do ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "salaotaberna",
    aliases: ["vestiario", "ct", "recuperar", "descansar"],
    category: "rpg",
    description: "Descansa no Vestiário dos Campeões e recupera 100% da estamina e energia",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏆 *VESTIÁRIO DOS CAMPEÕES* 🏆   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `⚡ *Sessão de Fisioterapia & Hidratação de Elite!*\n`;
        doc += `O Camisa 10 liberou o suporte completo do CT para você voltar com força máxima.\n\n`;
        doc += `✨ Sua estamina, foco e energia foram 100% restaurados!\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

