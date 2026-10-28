const { renderCard } = require("../../utils/uiEngine");
module.exports = {
    name: "talisma",
    aliases: ["amuletomagico", "talisman", "amuletorpg"],
    category: "rpg",
    description: "Consulta e gestão de talismãs mágicos do aventureiro",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "TALISMÃS & AMULETOS SAGRADOS",
            icon: "🧿",
            subtitle: `👤 *Portador:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "AMULETOS EQUIPADOS",
                    icon: "🛡️",
                    fields: [
                        { label: "Talismã do Dragão", value: "+20% Dano Crítico", icon: "🐉" },
                        { label: "Amuleto da Deusa", value: "+25% Defesa Espiritual", icon: "✨" }
                    ]
                }
            ],
            tip: "Talismãs reduzem o dano recebido em masmorras pesadelo!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};