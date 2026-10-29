/**
 * Comando .contraataquetotal
 * Habilidade Suprema de ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤: Reflete ataques mágicos multiplicando o dano com força avassaladora
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { calculateFullCharacterStats } = require("../../services/characterEngine");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "contraataquetotal",
    aliases: ["reagir", "contraataque", "full-counter", "refletir"],
    category: "rpg",
    description: "Ativa o Contra-ataque Total de ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ refletindo ataques mágicos com dano multiplicado",
    cooldownMs: 8000,
    execute: async ({ sender, reply, args }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);

        // Multiplicador do Contra-ataque Total de 2.5x a 4.0x
        const mult = (2.5 + Math.random() * 1.5).toFixed(1);
        const danoRefletido = Math.floor(stats.atk * parseFloat(mult));

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ⚡ *FULL COUNTER ATIVADO!* ⚡   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `⚔️ *➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ empunha a Sombria e assume a postura de reflexão mágica absoluta!*\n\n`;
        doc += `╭━〔 💥 REFLEXÃO MÁGICA 〕━⬣\n`;
        doc += `┃ 👤 *Guerreiro:* @${sender.split("@")[0]}\n`;
        doc += `┃ 🗡️ *Técnica:* Contra-ataque Total (全反撃)\n`;
        doc += `┃ 📈 *Multiplicador de Reflexão:* *${mult}x*\n`;
        doc += `┃ 💥 *Dano Mágico Refletido:* *-${danoRefletido.toLocaleString("pt-BR")} HP*\n`;
        doc += `┃ 🛡️ *Efeito:* Absorve 100% da magia ofensiva e devolve com o dobro de força!\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Use \`.contraataquetotal\` em combate contra chefes de raid e na arena para virar o rumo da batalha!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
