/**
 * Comando .tesouro / .tesourosagrado
 * Enciclopédia e Despertar dos 7 Tesouros Sagrados dos Sete Traços Capitais
 */

const { getBotName } = require("../../config/botConfig");

const SACRED_TREASURES = [
    { nome: "🗡️ Espada Demoníaca Sombria", dono: "GOAT (Pecado da Ira)", poder: "Cria clones físicos com dano multiplicado e reflete magias com Contra-ataque Total." },
    { nome: "🔨 Martelo Sagrado", dono: "Guerreira (Pecado da Inveja)", poder: "Manipula as placas tectônicas e absorve o impacto de magias na terra." },
    { nome: "🔱 Lança Espiritual Espiritual", dono: "King (Pecado da Preguiça)", poder: "Possui 8 formas divinas da Árvore Sagrada (Guardião, Pólen, Girassol, Multi-Lâminas)." },
    { nome: "🏹 Arco Duplo Duplo", dono: "Mago (Pecado da Luxúria)", poder: "Dispara flechas de luz mágica que reescrevem memórias e afetam o sistema nervoso." },
    { nome: "🔮 Estrela da Manhã Aldan", dono: "Mago (Pecado da Gula)", poder: "Orbe mágica que armazena feitiços infinitos e amplia poder de teletransporte." },
    { nome: "🪓 Machado Divino Rhitta", dono: "Herói (Pecado do Orgulho)", poder: "Armazena a radiação e calor solar de Herói, liberando com a técnica Sol Cruel." },
    { nome: "🥢 Bastão Sagrado Courechouse", dono: "Ban (Pecado da Ganância)", poder: "Amplia o alcance do Roubo Físico (Snatch), sugando atributos dos inimigos." }
];

module.exports = {
    name: "tesouro",
    aliases: ["tesouros", "sacredtreasure", "armassagradas"],
    category: "rpg",
    description: "Exibe os 7 Tesouros Sagrados dos Sete Traços Capitais e seus poderes",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   👑 *OS 7 TESOUROS SAGRADOS DE REINO* 👑   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *Armas forjadas pelo Rei Demônio e Rei das Fadas para liberar o potencial máximo dos Pecados Capitais.*\n\n`;

        SACRED_TREASURES.forEach((t) => {
            doc += `╭━〔 ${t.nome} 〕━⬣\n`;
            doc += `┃ 👤 *Portador Original:* ${t.dono}\n`;
            doc += `┃ 📜 *Habilidade Oculta:* _${t.poder}_\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        });

        doc += `💡 _Para liberar seu poder máximo de combate, digite \`.sombria\` ou veja seus equipamentos com \`.inv\`!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
