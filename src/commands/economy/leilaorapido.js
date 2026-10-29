const { nomeDoMembro } = require('../../utils/nomeMembro');
const { renderCard, formatCoins } = require("../../utils/uiEngine");
module.exports = {
    name: "leilaorapido",
    aliases: ["leilaogrupo","darleilao","lanceleilao","cmd_leilaorapido","alt_leilaorapido","atalho_leilaorapido","abrev_leilaorapido","call_leilaorapido","func_leilaorapido"],
    category: "economy",
    description: "Inicia um leilão de moedas ou relíquias no grupo",
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ sender, reply, args }) => {
        const lanceInicial = parseInt(args[0], 10) || 500;
        const card = renderCard({
            title: "LEILÃO RÁPIDO DO GRUPO!",
            icon: "🔨",
            subtitle: `📢 *Iniciado por:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "LOTE EM DISPUTA",
                    icon: "📦",
                    fields: [
                        { label: "Item", value: "Baú de Joias de Reino", icon: "💎" },
                        { label: "Lance Inicial", value: formatCoins(lanceInicial), icon: "💰" },
                        { label: "Duração", value: "5 Minutos", icon: "⏱️" }
                    ]
                }
            ],
            tip: "Envie seu lance para arrematar o lote!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};