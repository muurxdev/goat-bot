/**
 * Comando .pacto / .pactodemonio
 * Pacto das sombras que concede grande bônus de dano
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "pacto",
    aliases: ["pactodemonio", "pactodasombra", "contratosombrio"],
    category: "rpg",
    description: "Firma um pacto sombrio com os demônios em troca de poder imediato",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = xpData[sender] || { coins: 0 };

        const coinsGain = 3000;
        user.coins = (user.coins || 0) + coinsGain;
        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📜 *PACTO DAS SOMBRAS* 📜   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🩸 *Você assinou o pacto com sangue!*\n\n`;
        doc += `╭━〔 🌑 CONDIÇÕES DO PACTO 〕━⬣\n`;
        doc += `┃ 💰 *Adiantamento:* +${coinsGain.toLocaleString("pt-BR")} coins\n`;
        doc += `┃ 💥 *Bônus de Ataque:* +30% Dano Escuro por 24h\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

