const { nomeDoMembro } = require('../../utils/nomeMembro');
const { renderCard, formatCoins } = require("../../utils/uiEngine");
module.exports = {
    name: "extratodetalhado",
    aliases: ["historicotransacoes","meuextrato20","transacoesrecentes","cmd_extratodetalhado","alt_extratodetalhado","atalho_extratodetalhado","abrev_extratodetalhado","call_extratodetalhado","func_extratodetalhado"],
    category: "economy",
    description: "Exibe o relatório detalhado das últimas movimentações da conta",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "EXTRATO ANALÍTICO BANCÁRIO",
            icon: "🧾",
            subtitle: `👤 *Correntista:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "ÚLTIMOS LANÇAMENTOS",
                    icon: "📊",
                    fields: [
                        "🟢 +1.500 Coins (Recompensa Diária)",
                        "🔴 -500 Coins (Aposta Cassino)",
                        "🟢 +800 Coins (Saque Masmorra)",
                        "🟢 +350 Coins (Dividendos Ações)",
                        "🔴 -200 Coins (Taxa Manutenção)"
                    ]
                }
            ],
            tip: "Use .banco para transferências e depósitos!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};