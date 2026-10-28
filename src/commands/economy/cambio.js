const { renderCard } = require("../../utils/uiEngine");
module.exports = {
    name: "cambio",
    aliases: ["casadecambio","conversormoedas","cotacaocambio","cmd_cambio","alt_cambio","atalho_cambio","abrev_cambio","call_cambio","func_cambio"],
    category: "economy",
    description: "Consulta taxas de câmbio entre moedas do mundo e mágicas",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "CASA DE CÂMBIO DE REINO",
            icon: "💱",
            subtitle: `🌍 *Cotações Comerciais*`,
            sections: [
                {
                    title: "TAXAS DE CONVERSÃO",
                    icon: "🪙",
                    fields: [
                        "• 1 Dólar (USD) ➔ 1.000 Coins",
                        "• 1 Euro (EUR) ➔ 1.080 Coins",
                        "• 1 Bitcoin (BTC) ➔ 2.500.000 Coins",
                        "• 1 Cristal de Mana ➔ 5.000 Coins"
                    ]
                }
            ],
            tip: "Digite .cotacao para ver a cotação ao vivo via API!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};