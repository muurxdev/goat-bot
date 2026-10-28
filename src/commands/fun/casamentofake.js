/**
 * Comando .casamentofake
 * Cerimônia divertida de casamento fictício no grupo
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "casamentofake",
    aliases: ["casar", "cerimonialcasamento", "matrimoniofake"],
    category: "fun",
    description: "Cerimônia divertida de casamento fictício no grupo",
    cooldownMs: 2000,
    execute: async ({ sender, reply, mentioned }) => {
    if (!mentioned) return reply("❌ Marque a pessoa com quem deseja se casar (ex: `.casar @user`).");
    return reply("💍 *CERIMÔNIA DE CASAMENTO OFICIALIZADA!*\n\n👰🤵 Declaramos @" + sender.split("@")[0] + " e @" + mentioned.split("@")[0] + " casados sob a bênção do Reino de Reino!\n🎉 Viva os noivos!", [sender, mentioned]);
}
};
