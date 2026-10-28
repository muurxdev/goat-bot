const { renderCard } = require("../../utils/uiEngine");
module.exports = {
    name: "bolsadevalores",
    aliases: ["b3reino","mercadodeacoes","bolsadeacoes","cmd_bolsadevalores","alt_bolsadevalores","atalho_bolsadevalores","abrev_bolsadevalores","call_bolsadevalores","func_bolsadevalores"],
    category: "economy",
    description: "Consulta o índice e pregão da Bolsa de Valores de Reino",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "BOLSA DE VALORES DE REINO (BV-CENTRAL)",
            icon: "💹",
            subtitle: `📊 *Índice IBOV-BRIT:* 134.520 pts (+1.85%)`,
            sections: [
                {
                    title: "DESTAQUES DO PREGÃO",
                    icon: "📈",
                    fields: [
                        "🟢 *BOAR3 (Taverna do Javali):* R$ 42,50 (+4.2%)",
                        "🟢 *LION4 (Mineração Central):* R$ 28,10 (+2.8%)",
                        "🔴 *FAIR3 (Madeiras Rei Fada):* R$ 15,40 (-1.1%)",
                        "🟢 *MRLN11 (Tecnologia Mágica):* R$ 112,00 (+6.7%)"
                    ]
                }
            ],
            tip: "Use .acoes comprar <ticker> para investir!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};