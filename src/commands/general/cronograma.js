const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "cronograma",
    aliases: ["agendaeventos", "cronogramagrupo", "eventossemana"],
    category: "general",
    description: "Exibe o cronograma semanal de eventos e raids do grupo",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "CRONOGRAMA SEMANAL DE EVENTOS",
            icon: "📅",
            subtitle: "⚔️ *Calendário do Reino Central*",
            sections: [
                {
                    title: "DIAS & ATIVIDADES",
                    icon: "📜",
                    fields: [
                        "• **Segunda:** Início do Torneio de Torre",
                        "• **Quarta:** Raid Titânica contra o Rei Demônio",
                        "• **Sexta:** Sorteio da Loteria Milionária",
                        "• **Domingo:** Rodada de Bingo Comunitário"
                    ]
                }
            ],
            tip: "Participe dos eventos para ganhar bônus em dobro de XP e Coins!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};

