/**
 * Comando .talento / .arvoredetalentos
 * Árvore de talentos e habilidades passivas permanentes
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "talento",
    aliases: ["arvoredetalentos", "talentos", "passivas"],
    category: "rpg",
    description: "Consulta e aprimora a árvore de talentos e passivas do guerreiro",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🌳 *ÁRVORE DE TALENTOS* 🌳   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚔️ RAMIFICAÇÕES DE PODER 〕━⬣\n`;
        doc += `┃ 1. ⚔️ Força Bruta (+15% Dano Físico) ➔ Nível 3\n`;
        doc += `┃ 2. 🛡️ Pele de Ferro (+20% Resistência) ➔ Nível 2\n`;
        doc += `┃ 3. ⚡ Reflexo Divino (+10% Esquiva) ➔ Nível 1\n`;
        doc += `┃ 4. 🩸 Sedento por Sangue (+5% Roubo de Vida) ➔ Nível 1\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

