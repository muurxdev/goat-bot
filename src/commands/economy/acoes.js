/**
 * Comando .acoes / .bolsadevalores
 * Mercado de ações fictício com flutuação de cotações em tempo real
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

const STOCKS = [
    { code: "MELI3", name: "GOAT Tavern Co.", base: 120, delta: "+4.2%" },
    { code: "LION4", name: "Reino Central S.A.", base: 85, delta: "-1.8%" },
    { code: "FAIRY", name: "Floresta do Rei das Fadas", base: 210, delta: "+8.5%" },
    { code: "PURG1", name: "Mineração do Purgatório", base: 45, delta: "+15.0%" },
    { code: "SUNSH", name: "Energia Solar", base: 350, delta: "+2.1%" }
];

module.exports = {
    name: "acoes",
    aliases: ["bolsa","investiracoes","stockmarket","cmd_acoes","alt_acoes","atalho_acoes","abrev_acoes","call_acoes","func_acoes"],
    category: "economy",
    description: "Consulta cotações e opera na Bolsa de Valores de Reino",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = xpData[sender] || { coins: 0 };

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📈 *BOLSA DE VALORES REAL* 📈   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `💰 *Seu Patrimônio:* ${(user.coins || 0).toLocaleString("pt-BR")} coins\n\n`;
        doc += `╭━〔 📊 COTAÇÃO DAS PRINCIPAIS AÇÕES 〕━⬣\n`;

        STOCKS.forEach(s => {
            const isUp = s.delta.startsWith("+");
            doc += `┃ ${isUp ? "🟢" : "🔴"} *${s.code}* (${s.name})\n`;
            doc += `┃    └ Preço: ${s.base} coins | Variação: ${s.delta}\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Para investir moedas:_ \`.investir <quantidade>\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

