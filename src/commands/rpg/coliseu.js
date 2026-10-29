const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .coliseu / .gladiador / .coliseum
 * Batalhas diárias em ondas de gladiadores no Coliseu de Torre com premiações de XP, Coins e Fragmentos
 */

const { renderCard, formatCoins, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");

module.exports = {
    name: "coliseu",
    aliases: ["gladiador", "coliseum", "arena-coliseu", "torre-coliseu"],
    category: "rpg",
    description: "Desafie os gladiadores do Coliseu de Torre em ondas de combate",
    cooldownMs: 5000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const now = Date.now();
        const lastColiseu = user.lastColiseu || 0;
        const cooldown = 4 * 60 * 60 * 1000; // 4 horas

        if (now - lastColiseu < cooldown && !args[0]?.includes("force")) {
            const restante = Math.ceil((cooldown - (now - lastColiseu)) / (60 * 1000));
            return reply(`⏳ *Coliseu em Descanso:* Seus guerreiros estão se recuperando. Retorne em *${restante} minutos*!`);
        }

        const ondas = Math.floor(Math.random() * 5) + 3; // 3 a 7 ondas
        const vitorias = Math.floor(Math.random() * ondas) + 1;
        const baseLevel = user.level || 1;

        const xpBase = vitorias * (150 + baseLevel * 25);
        const coinsGanho = vitorias * (300 + baseLevel * 50);
        const fragmentos = Math.floor(vitorias / 2) + 1;

        const { xpGanho, lvlRes } = adicionarXp(user, xpBase, { source: "rpg" });
        user.coins = (user.coins || 0) + coinsGanho;
        user.wins = (user.wins || 0) + vitorias;
        user.losses = (user.losses || 0) + Math.max(0, ondas - vitorias);
        user.rpg = user.rpg || {};
        user.rpg.fragmentos = (user.rpg.fragmentos || 0) + fragmentos;
        user.lastColiseu = now;
        xpData[sender] = user;

        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "COLISEU DE TORRE — RESULTADO",
            icon: "🏛️",
            subtitle: `⚔️ *Guerreiro:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "ESTATÍSTICAS DA BATALHA",
                    icon: "📊",
                    fields: [
                        { label: "Ondas Enfrentadas", value: `${ondas} Ondas de Gladiadores`, icon: "🛡️" },
                        { label: "Ondas Conquistadas", value: `🏆 *${vitorias} / ${ondas} Vitoriosas*`, icon: "⚔️" },
                        { label: "Desempenho", value: vitorias >= 5 ? "🌟 *Imbatível (Campeão de Torre)*" : "🗡️ *Combatente Bravo*", icon: "🎖️" }
                    ]
                },
                {
                    title: "RECOMPENSAS CONQUISTADAS",
                    icon: "🎁",
                    fields: [
                        { label: "Experiência (XP)", value: `+${formatXP(xpGanho)}`, icon: "⚡" },
                        { label: "Moedas de Ouro", value: `+${formatCoins(coinsGanho)}`, icon: "💰" },
                        { label: "Fragmentos Sagrados", value: `+${fragmentos} Fragmentos`, icon: "💎" },
                        ...(lvlRes.subiu ? [{ label: "Subiu de nível", value: `agora nível ${user.level}`, icon: "🆙" }] : [])
                    ]
                }
            ],
            tip: "Use os fragmentos sagrados no ferreiro para forjar novas relíquias!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};
