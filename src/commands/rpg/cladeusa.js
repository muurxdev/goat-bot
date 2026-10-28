const { renderCard } = require("../../utils/uiEngine");
module.exports = {
    name: "cladeusa",
    aliases: ["deusas", "arcasagrada", "luzdivina"],
    category: "rpg",
    description: "Invoque a luz sagrada da Arca do Clã das Deusas",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "ARCA SAGRADA DO CLÃ DAS DEUSAS",
            icon: "☀️",
            subtitle: `✨ *Invocador:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "PODER DA LUZ SAGRADA",
                    icon: "📜",
                    fields: [
                        { label: "Técnica", value: "Purificação Absoluta (Arc)", icon: "🕊️" },
                        { label: "Efeito", value: "Dissipa maldições e cura 100% do HP", icon: "💖" },
                        { label: "Bônus", value: "Dano Sagrado contra Demônios +50%", icon: "⚔️" }
                    ]
                }
            ],
            tip: "A bênção da Arca purifica todas as trevas da batalha!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};