const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "resgatarpremio",
    aliases: ["resgatarcupom","usarcupom","codigopromo","cmd_resgatarpremio","alt_resgatarpremio","atalho_resgatarpremio","abrev_resgatarpremio","call_resgatarpremio","func_resgatarpremio"],
    category: "economy",
    description: "Resgate códigos promocionais de eventos para ganhar moedas",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const codigo = (args[0] || "").toUpperCase().trim();
        if (!codigo) return reply("❌ Informe o código promocional a ser resgatado (ex: `.resgatarpremio GOAT2026`).");

        // Verificar se o código é válido (lista em configs['global'].coupons)
        const configs = dataService.getConfigsData();
        const coupons = configs['global']?.coupons || {};
        const coupon = coupons[codigo];
        if (!coupon) {
            return reply("❌ *Código inválido ou inativo!* Verifique o código e tente novamente.");
        }

        // Verificar se o usuário já resgatou este código
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.redeemedCoupons = user.redeemedCoupons || [];
        if (user.redeemedCoupons.includes(codigo)) {
            return reply("❌ Você já resgatou este código anteriormente!");
        }

        const reward = coupon.amount || 1500;
        user.coins = (user.coins || 0) + reward;
        user.redeemedCoupons.push(codigo);
        await dataService.saveXpData(xpData);

        return reply("🎉 *CÓDIGO VALIDADO COM SUCESSO!*\n\n🎟️ Código: `" + codigo + "`\n💰 Recompensa: +" + formatCoins(reward) + " creditados!");
    }
};