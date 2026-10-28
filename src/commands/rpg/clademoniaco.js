const { renderCard } = require("../../utils/uiEngine");
module.exports = {
    name: "clademoniaco",
    aliases: ["demonios", "hellblaze", "chamasnegras"],
    category: "rpg",
    description: "Libere as Chamas Negras do Purgatório do Clã dos Demônios",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "CHAMAS NEGRAS DO PURGATÓRIO",
            icon: "🔥",
            subtitle: `🌑 *Lorde Demoníaco:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "PODER DA MATÉRIA ESCURA",
                    icon: "⚔️",
                    fields: [
                        { label: "Habilidade", value: "Hellblaze (Chamas Eternas)", icon: "🌑" },
                        { label: "Propriedade", value: "Anula a regeneração de imortais", icon: "💀" },
                        { label: "Bônus", value: "Dano de Fogo Negro +60%", icon: "💥" }
                    ]
                }
            ],
            tip: "O Hellblaze consome qualquer barreira mágica em segundos!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};