const { renderCard, formatCoins, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");
module.exports = {
    name: "duelobatalha",
    aliases: ["combaterapido", "lutar-ia", "dueloiarpg"],
    category: "rpg",
    description: "Batalha rápida em turnos contra campeões do Reino",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const vitoria = Math.random() > 0.4;
        const xpBase = vitoria ? 350 : 80;
        const coins = vitoria ? 700 : 150;

        const { xpGanho: xp, lvlRes } = adicionarXp(user, xpBase, { source: "rpg" });
        user.coins = (user.coins || 0) + coins;
        if (vitoria) {
            user.wins = (user.wins || 0) + 1;
        } else {
            user.losses = (user.losses || 0) + 1;
        }
        xpData[sender] = user;
        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "DUELO DA ARENA REAL",
            icon: "⚔️",
            subtitle: `👤 *Combatente:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "RESULTADO DO EMBATE",
                    icon: "🏆",
                    fields: [
                        { label: "Adversário", value: "Cavaleiro Sagrado Trovão", icon: "⚡" },
                        { label: "Desfecho", value: vitoria ? "👑 *VITÓRIA POR NOCAUTE!*" : "💥 *DERROTADO NA ARENA!*", icon: "🎖️" },
                        { label: "Ganhos", value: `+${formatXP(xp)} | +${formatCoins(coins)}`, icon: "🎁" },
                        ...(lvlRes.subiu ? [{ label: "Subiu de nível", value: `agora nível ${user.level}`, icon: "🆙" }] : [])
                    ]
                }
            ],
            tip: "Desafie outros jogadores com .duelo @user!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};