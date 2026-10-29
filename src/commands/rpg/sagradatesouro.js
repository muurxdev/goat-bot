const { nomeDoMembro } = require('../../utils/nomeMembro');
const { renderCard } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "sagradatesouro",
    aliases: ["tesourosagrado", "arma-sagrada", "sombria-arma", "rhitta-arma"],
    category: "rpg",
    description: "Aprimoramento individual dos Tesouros Sagrados lendários",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.rpg = user.rpg || {};
        user.rpg.tesouroLevel = (user.rpg.tesouroLevel || 1);

        const card = renderCard({
            title: "SANTUÁRIO DO TESOURO SAGRADO",
            icon: "🗡️",
            subtitle: `👤 *Portador:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "ARMA SAGRADA VINCULADA",
                    icon: "🔥",
                    fields: [
                        { label: "Arma", value: "Sombria (Espada Demoníaca)", icon: "🗡️" },
                        { label: "Nível Sagrado", value: `Grau ${user.rpg.tesouroLevel} ⭐`, icon: "📈" },
                        { label: "Multiplicador de Dano", value: `+${user.rpg.tesouroLevel * 15}% Dano Total`, icon: "⚡" }
                    ]
                }
            ],
            tip: "Use .forjar upgrade para aprimorar sua arma sagrada!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};