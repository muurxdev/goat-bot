const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .leilao
 * Casa de Leilões de Itens Lendários, Relíquias e Armas Sagradas
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

const AUCTION_LOTS = [
    { id: "rhitta", nome: "🪓 Machado Divino Rhitta (+4200 ATK)", lanceMinimo: 150000, donoOriginal: "Herói" },
    { id: "sombria", nome: "🗡️ Espada Sombria Demoníaca (+1100 ATK)", lanceMinimo: 60000, donoOriginal: "GOAT" },
    { id: "manto_divindade", nome: "🛡️ Manto da Suprema Divindade (+1600 DEF)", lanceMinimo: 120000, donoOriginal: "Suprema Divindade" }
];

module.exports = {
    name: "leilao",
    aliases: ["leiloes", "auction", "dar-lance", "leilaorpg"],
    category: "rpg",
    description: "Casa de Leilões do Reino: dê lances em itens lendários e raridades únicas",
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const sub = (args[0] || "").toLowerCase().trim();
        const valorLance = parseInt(args[1], 10);

        // Lote fixo do ciclo atual
        const lot = AUCTION_LOTS[0];

        if (sub === "lance" || sub === "apostar" || sub === "bid") {
            if (isNaN(valorLance) || valorLance <= 0) {
                return reply(`📌 *Como dar um lance:* \`.leilao lance <valor_em_coins>\`\n👉 *Exemplo:* \`.leilao lance 160000\``);
            }

            if (valorLance < lot.lanceMinimo) {
                return reply(`❌ O lance mínimo para o lote *"${lot.nome}"* é de *${lot.lanceMinimo.toLocaleString("pt-BR")} Coins*.`);
            }

            if ((user.coins || 0) < valorLance) {
                return reply(`🪙 Saldo insuficiente: Você possui apenas *${(user.coins || 0).toLocaleString("pt-BR")} Coins*.`);
            }

            return reply(`🔨 *LANCE REGISTRADO NO LEILÃO!*\n\n📦 *Lote:* ${lot.nome}\n👤 *Licitante:* ${nomeDoMembro(sender)}\n💰 *Valor do Lance:* *${valorLance.toLocaleString("pt-BR")} Coins*\n⏳ *Status:* O martelo baterá ao término da rodada!`, [sender]);
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏛️ *CASA DE LEILÕES DE REINO* 🏛️   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *Itens Míticos e Relíquias Divinas leiloadas periodicamente.*\n\n`;

        doc += `╭━〔 📦 LOTE ATUAL EM LEILÃO 〕━⬣\n`;
        doc += `┃ 🏆 *Item:* *${lot.nome}*\n`;
        doc += `┃ 👑 *Origem:* ${lot.donoOriginal}\n`;
        doc += `┃ 💰 *Lance Inicial Mínimo:* ${lot.lanceMinimo.toLocaleString("pt-BR")} Coins\n`;
        doc += `┃ 🔨 *Como ofertar:* \`.leilao lance <valor>\`\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `╭━〔 📜 PRÓXIMOS LOTES DA CASA 〕━⬣\n`;
        AUCTION_LOTS.slice(1).forEach((l, i) => {
            doc += `┃ ${i + 2}. ${l.nome} (Mín: ${l.lanceMinimo.toLocaleString("pt-BR")} Coins)\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `👑 *${botName}*`;
        return reply(doc.trim(), [sender]);
    }
};
