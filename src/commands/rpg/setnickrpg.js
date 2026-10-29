/**
 * Comando .setnickrpg / .nomerrpg / .codinomerpg
 * Define o codinome oficial do guerreiro no RPG de Reino
 */

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");

module.exports = {
    name: "setnickrpg",
    aliases: ["nomerrpg", "codinomerpg", "mudarnickrpg", "titulorpg", "nickrpg"],
    category: "rpg",
    description: "Configura ou altera o seu codinome oficial no RPG (ex: .setnickrpg ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤, O Camisa 10)",
    cooldownMs: 2000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();
        const codinome = (text || "").trim();

        if (!codinome || codinome.length < 2) {
            return reply(
                "❌ *Informe um codinome válido para o seu herói!*\n\n" +
                "📌 *Exemplos:*\n" +
                "• `.setnickrpg Sir Arthur, Rei de Cidade Dourada`\n" +
                "• `.setnickrpg Kaelen, O Assassino das Sombras`\n" +
                "• `.setnickrpg Herói, O Orgulho do Leão`"
            );
        }

        if (codinome.length > 35) {
            return reply("❌ O codinome não pode ultrapassar 35 caracteres.");
        }

        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        user.nicknameRpg = codinome;
        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📜 *REGISTRO DE REINO* 📜   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👑 *Codinome Gravado no Grimório Real:*\n\n`;
        doc += `⚔️ *${codinome}*\n\n`;
        doc += `💡 _Seu novo nome agora aparecerá nas batalhas, duelos e no seu \`.boneco\`._\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

