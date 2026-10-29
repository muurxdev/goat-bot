const { nomeDoMembro } = require('../../utils/nomeMembro');
const { renderCard } = require("../../utils/uiEngine");
module.exports = {
    name: "clahumanos",
    aliases: ["humanos", "cavaleirosagrado", "sagradocavaleiro"],
    category: "rpg",
    description: "Habilidades dos Nobres Cavaleiros Sagrados Central",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "ORDEM DOS CAVALEIROS SAGRADOS",
            icon: "🛡️",
            subtitle: `⚔️ *Paladino:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "VIRTUDE DOS HOMENS",
                    icon: "👑",
                    fields: [
                        { label: "Título de Honra", value: "Cavaleiro Sagrado de Diamante", icon: "🎖️" },
                        { label: "Habilidade", value: "Espada Relâmpago / Tempestade Arcana", icon: "⚡" },
                        { label: "Bônus", value: "+30% de Dano Físico & Crítico", icon: "💥" }
                    ]
                }
            ],
            tip: "A determinação humana rivaliza até com clãs mitológicos!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};