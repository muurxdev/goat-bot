const { renderCard } = require("../../utils/uiEngine");
module.exports = {
    name: "clagigantes",
    aliases: ["gigantes", "heavymetal", "criacaoterra"],
    category: "rpg",
    description: "Domine a força da terra e o Heavy Metal do Clã dos Gigantes",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "PODER TELÚRICO DOS GIGANTES",
            icon: "🗿",
            subtitle: `🏔️ *Guerreiro:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "TÉCNICA DE CRIAÇÃO",
                    icon: "🛡️",
                    fields: [
                        { label: "Técnica Suprema", value: "Heavy Metal (Corpo de Diamante)", icon: "💎" },
                        { label: "Defesa Física", value: "+85% de Resistência a Dano", icon: "🛡️" },
                        { label: "Golpe Sísmico", value: "Sand Whirl & Mother Catastrophe", icon: "🌪️" }
                    ]
                }
            ],
            tip: "O Heavy Metal transforma sua pele na dureza de minérios puros!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};