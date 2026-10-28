/**
 * Comando .reliquia / .reliquias
 * Catálogo e Forja de Relíquias Ancestrais do Reino com bônus passivos permanentes
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

const RELICS = [
    { nome: "🏆 Cálice da Fonte da Juventude", tipo: "Fadas", bonus: "+300 HP Máximo & Imunidade a Veneno", custo: 25000 },
    { nome: "👁️ Olho Mágico de Balor", tipo: "Gigantes", bonus: "+40% Precisão & Revela HP dos Inimigos", custo: 35000 },
    { nome: "🪞 Espelho Sagrado da Deusa", tipo: "Deusas", bonus: "+50 DEF & 15% Resistência Mágica", custo: 50000 },
    { nome: "🩸 Chifre de Cernunnos", tipo: "Demônios", bonus: "+150 ATK & 10% Dano Crítico", custo: 80000 },
    { nome: "👑 Fragmento do Caos Primordial", tipo: "Suprema", bonus: "+500 ATK, +300 DEF & +1000 HP", custo: 200000 }
];

module.exports = {
    name: "reliquia",
    aliases: ["reliquias", "reliquiasagrada", "artefato", "artefatos"],
    category: "rpg",
    description: "Exibe e forja Relíquias Ancestrais que concedem atributos sagrados perpétuos",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏺 *RELÍQUIAS ANCESTRAIS DE REINO* 🏺   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *Artefatos antigos imbuídos com o poder dos Quatro Clãs que concedem atributos passivos permanentes.*\n\n`;

        RELICS.forEach((r, i) => {
            doc += `╭━〔 ${i + 1}. ${r.nome} 〕━⬣\n`;
            doc += `┃ 🏛️ *Origem / Clã:* ${r.tipo}\n`;
            doc += `┃ 📜 *Bônus Passivo:* ${r.bonus}\n`;
            doc += `┃ 💰 *Custo de Restauração:* ${r.custo.toLocaleString("pt-BR")} Coins\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        });

        doc += `💡 _Para obter fragmentos de relíquias, explore masmorras com \`.dungeon\` ou vença o modo \`.pesadelo\`!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
