/**
 * Comando .arcanjo / .gracas
 * Guia e Despertar das Quatro Graças Divinas dos Quatro Grandes Arcanjos
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

const ARCANJOS = [
    { nome: "☀️ Ardente (Graça do Sol)", lider: "Ardente", bonus: "+50% ATK & Dano de Fogo Sagrado", req: "Nível 40", desc: "O poder do Sol atinge o ápice ao meio-dia, incinerando tudo em seu caminho." },
    { nome: "⚡ Anjo (Graça do Flash)", lider: "Anjo", bonus: "+35% Velocidade & Esquiva Extrema", req: "Nível 30", desc: "Movimenta-se na velocidade da luz celestial, esquivando de 45% dos ataques." },
    { nome: "🌪️ Sariel (Graça do Tornado)", lider: "Sariel", bonus: "+30% Crítico & Perfuração de Armadura", req: "Nível 25", desc: "Ventos cortantes que dilaceram a blindagem de qualquer boss." },
    { nome: "🌊 Tarmiel (Graça do Oceano)", lider: "Tarmiel", bonus: "+40% Regeneração de HP & Cura", req: "Nível 20", desc: "Um oceano sagrado que regenera ferimentos fatais instantaneamente." }
];

module.exports = {
    name: "arcanjo",
    aliases: ["arcanjos", "gracas", "quatroarcanjos", "gracadivina"],
    category: "rpg",
    description: "Exibe o templo dos Quatro Arcanjos e as Graças Divinas do Clã das Deusas",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🪽 *SANTUÁRIO DOS QUATRO ARCANJOS* 🪽   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *Bênçãos Supremas concedidas pela Suprema Divindade aos Quatro Guerreiros Celestiais.*\n\n`;

        ARCANJOS.forEach((arc, i) => {
            doc += `╭━〔 ${arc.nome} 〕━⬣\n`;
            doc += `┃ 🎖️ *Arcanjo Guardião:* ${arc.lider}\n`;
            doc += `┃ 📜 *Efeito Sagrado:* ${arc.bonus}\n`;
            doc += `┃ 📌 *Requisito:* ${arc.req}\n`;
            doc += `┃ 📖 _"${arc.desc}"_\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        });

        doc += `💡 _Para invocar os guerreiros celestiais em batalha, busque bênçãos com \`.bencao\`!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
