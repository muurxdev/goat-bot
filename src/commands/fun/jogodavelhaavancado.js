/**
 * Comando .jogodavelhaavancado
 * Desafie a Inteligência Artificial no Jogo da Velha
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "jogodavelhaavancado",
    aliases: ["velhaia", "tictactoepro", "velhaminimax"],
    category: "fun",
    description: "Desafie a Inteligência Artificial no Jogo da Velha",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "JOGO DA VELHA vs IA EXPERT",
        icon: "❌",
        subtitle: "🤖 *Modo Minimax Ativado*",
        sections: [
            {
                title: "ESTADO DA PARTIDA",
                icon: "⭕",
                fields: [
                    "[ ❌ ][ ⭕ ][ 3 ]",
                    "[ 4  ][ ❌ ][ 6 ]",
                    "[ 7  ][ 8  ][ ⭕ ]"
                ]
            }
        ],
        tip: "Envie .jogodavelhaavancado <posicao> de 1 a 9!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
