const { nomeDoMembro } = require('../../utils/nomeMembro');
const { renderCard, formatXP, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");
const { formatNumber } = require("../../utils/textoRpg");
module.exports = {
    name: "dungeonboss",
    aliases: ["chefao", "bossmasmorra", "chefedungeon"],
    category: "rpg",
    description: "Desafie o chefe final guardião da masmorra",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const vitoria = Math.random() > 0.4;
        const xpBase = vitoria ? 600 : 100;
        const coins = vitoria ? 1200 : 200;

        const { xpGanho: xp, lvlRes } = adicionarXp(user, xpBase, { source: "rpg" });
        user.coins = (user.coins || 0) + coins;
        if (vitoria) {
            user.bossesMortos = (user.bossesMortos || 0) + 1;
            user.wins = (user.wins || 0) + 1;
            try {
                const bossHistoryService = require("../../services/bossHistoryService");
                bossHistoryService.registrarAbate(user, { id: "golias_baste", nome: "Golias Blindado de Baste" }, { dano: 5000, tipo: "dungeon" });
            } catch (err) {
                const logger = require("../../core/logger");
                logger.warn(`[DUNGEONBOSS] Falha ao registrar abate: ${err.message}`);
            }
        } else {
            user.losses = (user.losses || 0) + 1;
        }
        xpData[sender] = user;
        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "CONFRONTO CONTRA O CHEFE DA DUNGEON",
            icon: "👹",
            subtitle: `⚔️ *Desafiante:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "DESFECHO DA BATALHA",
                    icon: "🏆",
                    fields: [
                        { label: "Chefe", value: "Golias Blindado de Baste", icon: "🛡️" },
                        { label: "Resultado", value: vitoria ? "👑 *VITÓRIA ÉPICA! O Chefe caiu!*" : "💀 *DERROTADO PELO CHEFE!*", icon: "⚔️" },
                        { label: "Recompensa", value: `+${formatXP(xp)} | +${formatCoins(coins)}`, icon: "🎁" },
                        ...(lvlRes && lvlRes.subiu ? [{ label: "Subiu de nível", value: `agora nível ${formatNumber(user.level)}`, icon: "🆙" }] : [])
                    ]
                }
            ],
            tip: "Aprimore suas armas no ferreiro para garantir a vitória!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};