const { renderCard, formatCoins } = require("../../utils/uiEngine");
module.exports = {
    name: "cofrinhogrupo",
    aliases: ["vaquinhagrupo","coletivocofre","poupancagrupo","cmd_cofrinhogrupo","alt_cofrinhogrupo","atalho_cofrinhogrupo","abrev_cofrinhogrupo","call_cofrinhogrupo","func_cofrinhogrupo"],
    category: "economy",
    description: "Cofrinho comunitário de metas do grupo",
    groupOnly: true,
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "COFRINHO COMUNITÁRIO DO GRUPO",
            icon: "🐷",
            subtitle: `🏰 *Meta Comunitária*`,
            sections: [
                {
                    title: "STATUS DO COFRINHO",
                    icon: "📊",
                    fields: [
                        { label: "Acumulado", value: formatCoins(12500), icon: "💰" },
                        { label: "Meta", value: formatCoins(50000), icon: "🎯" },
                        { label: "Progresso", value: "[████░░░░░░] 25%", icon: "📈" }
                    ]
                }
            ],
            tip: "Doe moedas com .tesouro doar <valor> para bater a meta!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};