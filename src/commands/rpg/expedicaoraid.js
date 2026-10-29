const { nomeDoMembro } = require('../../utils/nomeMembro');
const { renderCard, formatCoins, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");
module.exports = {
    name: "expedicaoraid",
    aliases: ["expedicaoauto", "farmrpgauto", "expedicaofora"],
    category: "rpg",
    description: "Inicie ou resgate recompensas de expedições automáticas",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const xpBase = 500;
        const ganhoCoins = 1000;

        const { xpGanho: ganhoXp, lvlRes } = adicionarXp(user, xpBase, { source: "rpg" });
        user.coins = (user.coins || 0) + ganhoCoins;
        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "EXPEDIÇÃO DE AVENTUREIROS — RETORNO",
            icon: "⛺",
            subtitle: `🗺️ *Líder da Tropa:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "SAQUE DA EXPEDIÇÃO",
                    icon: "🎒",
                    fields: [
                        { label: "Território Explorado", value: "Ruínas do Castelo de Cidade Dourada", icon: "🏰" },
                        { label: "Experiência Coletada", value: `+${formatXP(ganhoXp)}`, icon: "⚡" },
                        { label: "Ouro Saqueado", value: `+${formatCoins(ganhoCoins)}`, icon: "💰" },
                        ...(lvlRes.subiu ? [{ label: "Subiu de nível", value: `agora nível ${user.level}`, icon: "🆙" }] : [])
                    ]
                }
            ],
            tip: "Envie expedições antes de dormir para acordar com baús cheios!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};