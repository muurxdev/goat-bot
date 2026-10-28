/**
 * Comando .animesazonal / .temporadaanime / .topseason
 * Lista os principais animes da temporada atual com notas e episódios
 */

const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "animesazonal",
    aliases: ["temporadaanime", "topseason", "animesdatemporada"],
    category: "general",
    description: "Lista os animes mais populares da temporada atual",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const animes = [
            "2. ⭐ *Solo Leveling Season 2* (Nota: 8.9)",
            "3. ⭐ *Bleach: Thousand-Year Blood War* (Nota: 9.1)",
            "4. ⭐ *Demon Slayer: Infinity Castle Arc* (Nota: 9.0)",
            "5. ⭐ *Chainsaw Man: Reze Arc* (Nota: 8.7)"
        ];

        const card = renderCard({
            title: "ANIMES DA TEMPORADA ATUAL",
            icon: "🌸",
            subtitle: `📺 *Temporada de Animes 2026*`,
            sections: [
                {
                    title: "TOP 5 ANIMES MAIS POPULARES",
                    icon: "🏆",
                    fields: animes
                }
            ],
            tip: "Use .anime <nome> para ver a ficha completa de qualquer anime!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

