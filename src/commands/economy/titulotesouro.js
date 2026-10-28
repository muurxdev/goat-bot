const { renderCard, formatCoins } = require("../../utils/uiEngine");

module.exports = {
    name: "titulotesouro",
    aliases: ["tesourodireto","titulosreais","investirtesouro","cmd_titulotesouro","alt_titulotesouro","atalho_titulotesouro","abrev_titulotesouro","call_titulotesouro","func_titulotesouro"],
    category: "economy",
    description: "Investimento em Títulos Públicos do Tesouro Real Central",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "TÍTULOS DO TESOURO REAL CENTRAL",
            icon: "📜",
            subtitle: "🏛️ *Renda Fixa Sagrada*",
            sections: [
                {
                    title: "OPÇÕES DE RENDIMENTO",
                    icon: "💰",
                    fields: [
                        { label: "Tesouro Selic Central", value: "Rende 100% do CDI (Liquidez Diária)", icon: "📈" },
                        { label: "Tesouro IPCA+", value: "Inflação + 6.5% ao ano", icon: "🛡️" },
                        { label: "Aplicação Mínima", value: formatCoins(500), icon: "💳" }
                    ]
                }
            ],
            tip: "Investimento seguro garantido pelo Rei Bartra!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};

