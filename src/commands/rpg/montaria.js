const { nomeDoMembro } = require('../../utils/nomeMembro');
const { renderCard } = require("../../utils/uiEngine");
module.exports = {
    name: "montaria",
    aliases: ["minhamontaria", "cavalosagrado"],
    category: "rpg",
    description: "Exibe os atributos e velocidade da sua montaria ativa",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "ESTÁBULO REAL DE REINO",
            icon: "🐎",
            subtitle: `🏇 *Cavaleiro:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "MONTARIA PRINCIPAL",
                    icon: "🐾",
                    fields: [
                        { label: "Criatura", value: "Porco Falante Gigante (Mama Guardião)", icon: "🐷" },
                        { label: "Velocidade", value: "120 km/h (Viagem Instantânea)", icon: "⚡" },
                        { label: "Capacidade de Carga", value: "10.000 Itens", icon: "🎒" }
                    ]
                }
            ],
            tip: "Montarias reduzem o tempo de espera das expedições!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};