const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "reliquiaperdida",
    aliases: ["escavar", "ruinasantigas", "arqueologiarpg"],
    category: "rpg",
    description: "Escave ruínas ancestrais para encontrar relíquias preciosas",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        const reliquias = ["Amuleto do Rei Demônio", "Asa Petrificada da Deusa", "Fragmento da Espada Coffin of Eternal Darkness"];
        const encontrada = reliquias[Math.floor(Math.random() * reliquias.length)];
        const valor = Math.floor(Math.random() * 800) + 400;

        user.coins = (user.coins || 0) + valor;
        await dataService.saveXpData(xpData);

        return reply(`🏺 *RELÍQUIA ANCESTRAL ENCONTRADA!*\n\n✨ Você escavou: *${encontrada}*!\n💰 *Valor de Venda:* +${formatCoins(valor)}`);
    }
};