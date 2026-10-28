/**
 * Comando .setdevice / .meudispositivo / .alterardispositivo
 * Define ou atualiza o modelo de dispositivo utilizado pelo usuário (ex: Acer Aspire V15, Samsung A25)
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "setdevice",
    aliases: ["meudispositivo", "alterardispositivo", "mudardevice", "definiraparelho"],
    category: "general",
    description: "Configura ou altera o modelo do seu dispositivo (ex: .setdevice Acer Aspire V15)",
    cooldownMs: 2000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();
        const model = (text || "").trim();

        if (!model) {
            return reply(
                "❌ *Informe o modelo do seu aparelho!*\n\n" +
                "📌 *Exemplos:*\n" +
                "• `.setdevice Acer Aspire V15 (Linux)`\n" +
                "• `.setdevice Samsung Galaxy A25 5G`\n" +
                "• `.setdevice iPhone 15 Pro Max`"
            );
        }

        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        user.dispositivoModelo = model;
        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📱 *DISPOSITIVO ATUALIZADO* 📱   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✅ *Modelo Registrado com Sucesso!*\n\n`;
        doc += `💻 *Aparelho:* ${model}\n`;
        doc += `💡 _Este modelo agora será exibido no seu \`.dossie\` e \`.device\`._\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

