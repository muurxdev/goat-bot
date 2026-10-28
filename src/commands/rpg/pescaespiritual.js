const { renderCard, formatCoins, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "pescaespiritual",
    aliases: ["pescasagrada", "pescalago", "pescamagica"],
    category: "rpg",
    description: "Pesque criaturas aquáticas raras e pérolas mágicas no lago",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        const peixes = ["Carpa Dourada de Reino (Rara)", "Peixe Dragão do Abismo (Épico)", "Pérola Sagrada das Deusas (Lendária)"];
        const sorteado = peixes[Math.floor(Math.random() * peixes.length)];
        const coins = Math.floor(Math.random() * 500) + 300;

        user.coins = (user.coins || 0) + coins;
        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "PESCA ESPIRITUAL NO LAGO SAGRADO",
            icon: "🎣",
            subtitle: `🌊 *Pescador:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "RESULTADO DA PESCARIA",
                    icon: "🐟",
                    fields: [
                        { label: "Captura", value: sorteado, icon: "🐠" },
                        { label: "Valor de Mercado", value: `+${formatCoins(coins)}`, icon: "💰" }
                    ]
                }
            ],
            tip: "Pesque diariamente para encontrar pérolas mágicas!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};