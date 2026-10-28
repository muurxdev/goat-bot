/**
 * Comando .topmangalist
 * Ranking dos mangás mais vendidos e aclamados de todos os tempos
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "topmangalist",
    aliases: ["melhoresmangas", "mangaspopulares", "topmanga"],
    category: "general",
    description: "Ranking dos mangás mais vendidos e aclamados de todos os tempos",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "TOP MANGÁS MAIS ACLAMADOS DA HISTÓRIA",
        icon: "📚",
        subtitle: "⭐ *Ranking Global MyAnimeList*",
        sections: [
            {
                title: "TOP 5 OBRAS PRIMAS",
                icon: "🏆",
                fields: [
                    "1. ⭐ *Berserk* (Kentaro Miura) — Nota: 9.47",
                    "2. ⭐ *JoJo's Bizarre Adventure Part 7: Steel Ball Run* — Nota: 9.30",
                    "3. ⭐ *One Piece* (Eiichiro Oda) — Nota: 9.22",
                    "4. ⭐ *Vagabond* (Takehiko Inoue) — Nota: 9.25",
                    "5. ⭐ *Monster* (Naoki Urasawa) — Nota: 9.15"
                ]
            }
        ],
        tip: "Use .manga <nome> para pesquisar qualquer mangá!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
