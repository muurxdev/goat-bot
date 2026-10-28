/**
 * Comando .timezonelist
 * Consulta o horário atual nas principais metrópoles globais
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "timezonelist",
    aliases: ["fusoeshorarios","horariomundial","horariocapital","cmd_timezonelist","alt_timezonelist","atalho_timezonelist","abrev_timezonelist","call_timezonelist","func_timezonelist"],
    category: "dev",
    description: "Consulta o horário atual nas principais metrópoles globais",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "RELÓGIO MUNDIAL — FUSOS HORÁRIOS",
        icon: "⏱️",
        subtitle: "🌍 *Horário Internacional*",
        sections: [
            {
                title: "METRÓPOLES GLOBAIS",
                icon: "🏙️",
                fields: [
                    { label: "Brasília / SP (UTC-3)", value: new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }), icon: "🇧🇷" },
                    { label: "Londres (UTC+1)", value: new Date().toLocaleTimeString("pt-BR", { timeZone: "Europe/London" }), icon: "🇬🇧" },
                    { label: "Tóquio (UTC+9)", value: new Date().toLocaleTimeString("pt-BR", { timeZone: "Asia/Tokyo" }), icon: "🇯🇵" },
                    { label: "Nova York (UTC-4)", value: new Date().toLocaleTimeString("pt-BR", { timeZone: "America/New_York" }), icon: "🇺🇸" }
                ]
            }
        ],
        tip: "Use para sincronizar servidores em fusos horários internacionais!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
