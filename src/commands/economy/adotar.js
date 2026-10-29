const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .adotar / .adotacao
 * Sistema de adoção de filhos no grupo com certidão social
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "adotar",
    aliases: ["adotacao","adotarfilho","filho","cmd_adotar","alt_adotar","atalho_adotar","abrev_adotar","call_adotar","func_adotar"],
    category: "economy",
    description: "Adota um participante do grupo como filho oficial",
    groupOnly: true,
    cooldownMs: 4000,
    execute: async ({ sender, reply, info }) => {
        const botName = getBotName();
        const contextInfo = info?.message?.extendedTextMessage?.contextInfo;
        const target = contextInfo?.mentionedJid?.[0];

        if (!target) {
            return reply("❌ *Mencione quem você deseja adotar!*\n\n📌 *Exemplo:* `.adotar @usuario`");
        }

        const xpData = dataService.getXpData();
        if (!xpData[sender]) xpData[sender] = {};
        if (!xpData[sender].children) xpData[sender].children = [];

        if (xpData[sender].children.includes(target)) {
            return reply("⚠️ Este participante já foi adotado por você.");
        }

        xpData[sender].children.push(target);
        await dataService.saveXpData(xpData);

        const targetNum = target.split("@")[0].split(":")[0];
        const senderNum = sender.split("@")[0].split(":")[0];

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📜 *CERTIDÃO DE ADOÇÃO* 📜   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *Adoção oficializada em Reino!*\n\n`;
        doc += `╭━〔 👶 NOVO MEMBRO DA FAMÍLIA 〕━⬣\n`;
        doc += `┃ 👨‍👦 *Responsável:* ${nomeDoMembro(sender)}\n`;
        doc += `┃ 👶 *Criança adotada:* @${targetNum}\n`;
        doc += `┃ ⚖️ *Pensão Alimentícia:* 50 coins por dia\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender, target]);
    }
};

