const { renderCard } = require("../../utils/uiEngine");
module.exports = {
    name: "bencaosol",
    aliases: ["gracasol", "theonesun", "solradiante"],
    category: "rpg",
    description: "Invoque o calor supremo da Graça do Sol Sunshine",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "GRAÇA DIVINA: SUNSHINE",
            icon: "☀️",
            subtitle: `🔥 *Lorde do Sol:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "PODER MÁXIMO DO MEIO-DIA",
                    icon: "🌞",
                    fields: [
                        { label: "Graça Arcana", value: "Sunshine (O Ápice do Sol)", icon: "☀️" },
                        { label: "Poder Térmico", value: "Incinera armaduras instantaneamente", icon: "💥" },
                        { label: "Status", value: "+100% de Dano de Fogo Sagrado", icon: "🔥" }
                    ]
                }
            ],
            tip: "O Sol atinge seu ápice absoluto ao meio-dia!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};