const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .bencao / .oracao / .graca
 * Solicite a bênção divina diária da Deusa Suprema ou do Rei dos Demônios
 */

const { renderCard, formatCoins, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");

module.exports = {
    name: "bencao",
    aliases: ["oracao", "graca", "bencao-divina", "bencao-demoniaca"],
    category: "rpg",
    description: "Receba uma bênção sagrada ou demoníaca temporária para seu personagem",
    cooldownMs: 5000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const now = Date.now();
        const lastBencao = user.lastBencao || 0;
        const cooldown = 12 * 60 * 60 * 1000; // 12 horas

        if (now - lastBencao < cooldown && !args[0]?.includes("force")) {
            const horas = Math.ceil((cooldown - (now - lastBencao)) / (60 * 60 * 1000));
            return reply(`⏳ *Altar Sagrado em Repouso:* Você já recebeu as graças divinas hoje. Retorne em *${horas} horas*!`);
        }

        const tipo = Math.random() > 0.5 ? "deusa" : "demonio";
        const xpBase = Math.floor(Math.random() * 500) + 300;
        const coinsBonus = Math.floor(Math.random() * 1000) + 500;

        const { xpGanho: xpBonus, lvlRes } = adicionarXp(user, xpBase, { source: "rpg" });
        user.coins = (user.coins || 0) + coinsBonus;
        user.lastBencao = now;

        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: tipo === "deusa" ? "BÊNÇÃO DA DEUSA SUPREMA" : "BÊNÇÃO DO REI DOS DEMÔNIOS",
            icon: tipo === "deusa" ? "✨" : "🔥",
            subtitle: `🙏 *Devoto:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "GRAÇA CONCEDIDA",
                    icon: "📜",
                    fields: [
                        { label: "Entidade", value: tipo === "deusa" ? "☀️ Clã das Deusas" : "🌑 Clã dos Demônios", icon: "👑" },
                        { label: "Bônus Espiritual", value: `+${formatXP(xpBonus)}`, icon: "⚡" },
                        { label: "Oferenda Sagrada", value: `+${formatCoins(coinsBonus)}`, icon: "💰" },
                        ...(lvlRes.subiu ? [{ label: "Subiu de nível", value: `agora nível ${user.level}`, icon: "🆙" }] : [])
                    ]
                }
            ],
            tip: "Volte a cada 12 horas para renovar seus votos e receber mais recompensas!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};
