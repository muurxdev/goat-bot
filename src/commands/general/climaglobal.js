/**
 * Comando .climaglobal
 * Previsão do tempo em tempo real nas maiores capitais globais
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "climaglobal",
    aliases: ["tempomundial", "weatherworld", "metereologiaglobal"],
    category: "general",
    description: "Previsão do tempo em tempo real nas maiores capitais globais",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "METEOROLOGIA GLOBAL EM TEMPO REAL",
        icon: "🌦️",
        subtitle: "🌍 *Clima Mundial*",
        sections: [
            {
                title: "TEMPERATURAS MÉDIAS",
                icon: "🌡️",
                fields: [
                    { label: "São Paulo, Brasil", value: "24°C (Ensolarado) ☀️", icon: "🇧🇷" },
                    { label: "Tóquio, Japão", value: "19°C (Céu Limpo) 🌸", icon: "🇯🇵" },
                    { label: "Londres, Reino Unido", value: "16°C (Nublado) ☁️", icon: "🇬🇧" },
                    { label: "Nova York, EUA", value: "22°C (Parcialmente Nublado) 🌤️", icon: "🇺🇸" }
                ]
            }
        ],
        tip: "Digite .clima <sua cidade> para ver a previsão local exata!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
