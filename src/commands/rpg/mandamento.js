/**
 * Comando .mandamento / .dezmandamentos
 * Guia dos Dez Preceitos do Rei Demônio e Maldições Demoníacas
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

const MANDAMENTOS = [
    { nome: "👑 Piedade (Sombra)", portador: "Sombra", efeito: "Quem der as costas a ele torna-se servo incondicional.", bonus: "+45% Dano Demoníaco & Absorção de Força" },
    { nome: "❤️ Amor (Titã)", portador: "Titã / Ardente", efeito: "Aquele que guardar ódio perde a capacidade de atacar.", bonus: "Bloqueia 50% dos ataques do oponente" },
    { nome: "⚖️ Verdade (Cavaleiro)", portador: "Cavaleiro", efeito: "Aquele que mentir perante ele é transformado em pedra.", bonus: "+35% Dano Crítico Físico" },
    { nome: "🔒 Retenção (Juiz)", portador: "Juiz", efeito: "Sela a fala e poderes ocultos de quem expressar sentimentos.", bonus: "+40% Dano de Chamas do Purgatório" },
    { nome: "🐍 Fé (Rainha)", portador: "Rainha", efeito: "Quem demonstrar infidelidade tem a alma incinerada.", bonus: "Rouba 25% de Vida por Golpe (Lifesteal)" }
];

module.exports = {
    name: "mandamento",
    aliases: ["mandamentos", "dezmandamentos", "reidemonio"],
    category: "rpg",
    description: "Exibe os Dez Preceitos do Rei Demônio e suas maldições no Reino Demoníaco",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🌑 *OS DEZ PRECEITOS DO PURGATÓRIO* 🌑   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🔥 *Fragmentos do poder absoluto divididos pelo Rei Demônio aos guerreiros de elite.*\n\n`;

        MANDAMENTOS.forEach((m) => {
            doc += `╭━〔 ${m.nome} 〕━⬣\n`;
            doc += `┃ 👤 *Portador de Elite:* ${m.portador}\n`;
            doc += `┃ 📜 *Maldição:* _${m.efeito}_\n`;
            doc += `┃ 💥 *Bônus em Combate:* ${m.bonus}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        });

        doc += `💡 _Para enfrentar entidades demoníacas em combate, use \`.boss\` ou \`.dungeon\`!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
