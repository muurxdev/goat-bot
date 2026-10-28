const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "alquimia",
    aliases: ["alquimista", "transmutar", "pocao-alquimia"],
    category: "rpg",
    description: "Transmuta ingredientes e ervas raras em elixires mágicos",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.coins = (user.coins || 0) + 400;
        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "LABORATÓRIO ALQUÍMICO CENTRAL",
            icon: "🧪",
            subtitle: `🧙 *Alquimista:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "TRANSMUTAÇÃO CONCLUÍDA",
                    icon: "✨",
                    fields: [
                        { label: "Elixir Criado", value: "Poção da Força Titânica", icon: "🍷" },
                        { label: "Recompensa", value: "+400 Coins recuperados", icon: "💰" }
                    ]
                }
            ],
            tip: "Use suas poções nas masmorras e raids para dobrar o dano!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};