const { renderCard } = require("../../utils/uiEngine");
module.exports = {
    name: "esferamagica",
    aliases: ["esferamago", "aldanesfera", "esferasolar"],
    category: "rpg",
    description: "Conjure esferas arcanas elementais de Mago",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "ESFERAS ELEMENTAIS DE MAGO",
            icon: "🔮",
            subtitle: `🧙 *Mago:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "CATÁLOGO DE CONJURAÇÃO",
                    icon: "✨",
                    fields: [
                        { label: "Jóia da Paz", value: "Aldan (Tesouro Sagrado)", icon: "💎" },
                        { label: "Elementos", value: "Fogo Negro, Gelo Eterno, Trovão Divino", icon: "⚡" },
                        { label: "Magia Contínua", value: "Infinity (Duração Infinita)", icon: "♾️" }
                    ]
                }
            ],
            tip: "A magia Infinity nunca cessa a menos que o conjurador deseje!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};