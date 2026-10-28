/**
 * Comando .personagemanime
 * Consulta a biografia e poderes de personagens de animes
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "personagemanime",
    aliases: ["fichapersonagem", "infopersonagem", "personageminfo"],
    category: "general",
    description: "Consulta a biografia e poderes de personagens de animes",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "FICHA TÉCNICA: GOAT",
        icon: "🐉",
        subtitle: "👑 *O Dragão da Ira*",
        sections: [
            {
                title: "DADOS BIOGRÁFICOS",
                icon: "📜",
                fields: [
                    { label: "Clã", value: "Clã dos Demônios (Ex-Líder dos 10 Mandamentos)", icon: "🌑" },
                    { label: "Tesouro Sagrado", value: "Espada Demoníaca Sombria", icon: "🗡️" },
                    { label: "Poder Mágico", value: "Contra-ataque Total (Contra-Ataque Total)", icon: "⚡" },
                    { label: "Poder de Luta", value: "142.000+ (Modo de Assalto)", icon: "🔥" }
                ]
            }
        ],
        tip: "Use .anime <nome> para ver a ficha completa de qualquer anime!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
