const { renderCard } = require("../../utils/uiEngine");
module.exports = {
    name: "clafadas",
    aliases: ["fadas", "desastre", "floresta-fadas"],
    category: "rpg",
    description: "Comande a magia natural e o poder do Desastre do Rei Fada",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "MAGIA DA FLORESTA DO REI FADA",
            icon: "🧚",
            subtitle: `🌸 *Guardião:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "DOMÍNIO NATURAL",
                    icon: "🍃",
                    fields: [
                        { label: "Poder Inato", value: "Disaster (Controle de Vida & Toxinas)", icon: "🌿" },
                        { label: "Arma Mística", value: "Lança Espiritual Espiritual", icon: "🗡️" },
                        { label: "Velocidade", value: "+45% de Esquiva em Voo", icon: "💨" }
                    ]
                }
            ],
            tip: "A Espiritual possui 8 formas distintas de combate!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};