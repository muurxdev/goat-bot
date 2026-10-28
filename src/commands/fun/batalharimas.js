/**
 * Comando .batalharimas
 * Gere uma batalha de rimas rápida entre dois guerreiros
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "batalharimas",
    aliases: ["batalhaderima", "rimasrap", "freestylerap"],
    category: "fun",
    description: "Gere uma batalha de rimas rápida entre dois guerreiros",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const rimas = [
        "Chego no combate com a força de um trovão,\nMinha rima é lendária, venço até o Rei Dragão!",
        "Na arena do WhatsApp ninguém pode me parar,\nCom meu fluxo pesado faço o servidor tremer no ar!"
    ];
    const card = renderCard({
        title: "BATALHA DE RIMAS — FLOW ÉPICO",
        icon: "🎤",
        subtitle: "🔥 *MC do Reino:* @" + sender.split("@")[0],
        sections: [
            {
                title: "VERSOS DO COMBATE",
                icon: "🎵",
                fields: rimas
            }
        ],
        tip: "Mande seus versos no chat para disputar o microfone de ouro!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
