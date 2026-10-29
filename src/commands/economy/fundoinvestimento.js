const { nomeDoMembro } = require('../../utils/nomeMembro');
const { renderCard, formatCoins } = require("../../utils/uiEngine");
module.exports = {
    name: "fundoinvestimento",
    aliases: ["fundoimobiliario","fundoeconomia","investirfundo","cmd_fundoinvestimento","alt_fundoinvestimento","atalho_fundoinvestimento","abrev_fundoinvestimento","call_fundoinvestimento","func_fundoinvestimento"],
    category: "economy",
    description: "Invista em fundos imobiliários do Reino Central",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "FUNDO IMOBILIÁRIO CENTRAL",
            icon: "🏢",
            subtitle: `💼 *Investidor:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "CARTEIRA DE ATIVOS",
                    icon: "📈",
                    fields: [
                        { label: "Fundo", value: "LION11 — Castelos & Tavernas", icon: "🏰" },
                        { label: "Dividend Yield", value: "14.2% ao ano (Mensal)", icon: "💰" },
                        { label: "Cota Atual", value: formatCoins(1500), icon: "🏷️" }
                    ]
                }
            ],
            tip: "Compre cotas com .investir para receber rendimentos automáticos!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};