/**
 * Comando .reviver / .lagrimadadeusa
 * Revive o jogador — restaura HP total sem custo
 */

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { resolveHp } = require("../../services/characterEngine");

module.exports = {
    name: "reviver",
    aliases: ["lagrimadadeusa", "ressuscitar", "revive", "curaancestral"],
    category: "rpg",
    subcategory: "Sobrevivência",
    description: "Usa a Lágrima da Deusa para restaurar HP total e reviver",
    cooldownMs: 4000,
    execute: async ({ reply, sender }) => {
        const botName = getBotName();
        const senderNum = sender.split("@")[0].split(":")[0];
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const hp = resolveHp(user);
        const hpAnterior = hp.atual;
        user.hp = hp.max;

        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   💧 *LÁGRIMA DA DEUSA* 💧   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *A energia vital de @${senderNum} foi restaurada!*\n\n`;
        doc += `❤️ *HP:* ${hpAnterior} → *${hp.max}* (100%)\n`;
        doc += `${hp.barra}\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
