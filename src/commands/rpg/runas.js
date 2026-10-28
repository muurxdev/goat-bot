/**
 * Comando .runas / .encantar / .runa
 * Forja, compra e equipamento de runas mágicas sagradas com bônus de combate reais
 */

const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { calculateFullCharacterStats } = require("../../services/characterEngine");

const RUNAS_INFO = {
    fogo: { id: "fogo", nome: "Runa das Chamas do Purgatório", atk: 80, def: 20, crit: 10, bonus: "+80 ATK / +10% Crítico", custo: 5000, emoji: "🔥" },
    raio: { id: "raio", nome: "Runa do Relâmpago Sagrado", atk: 110, def: 30, crit: 15, bonus: "+110 ATK / +15% Crítico", custo: 8500, emoji: "⚡" },
    trevas: { id: "trevas", nome: "Runa da Escuridão Demoníaca", atk: 180, def: 60, crit: 20, bonus: "+180 ATK / +60 DEF / Lifesteal", custo: 15000, emoji: "🌑" },
    luz: { id: "luz", nome: "Runa da Graça Celestial", atk: 250, def: 150, crit: 25, bonus: "+250 ATK / +150 DEF / Regeneração", custo: 25000, emoji: "✨" }
};

module.exports = {
    name: "runas",
    aliases: ["runa", "encantar", "forjar-runa", "equipar-runa"],
    category: "rpg",
    description: "Forje, compre e equipe runas mágicas sagradas em suas armas e armaduras",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        if (!Array.isArray(user.activeRunes)) {
            user.activeRunes = [];
        }

        const sub = (args[0] || "").toLowerCase().trim();
        const runaKey = (args[1] || "").toLowerCase().trim();

        // 1. FORJAR / COMPRAR / EQUIPAR
        if (sub === "forjar" || sub === "comprar" || sub === "equipar") {
            if (!runaKey) {
                return reply("📌 *Como usar:* `.runas equipar <fogo|raio|trevas|luz>`\n👉 *Exemplo:* `.runas equipar fogo`");
            }

            const runa = RUNAS_INFO[runaKey];
            if (!runa) {
                return reply("❌ *Runa inválida!* Escolha entre: `fogo`, `raio`, `trevas` ou `luz`.");
            }

            if (user.activeRunes.some(r => (typeof r === 'string' ? r === runaKey : r.id === runaKey))) {
                return reply(`⚠️ *Runa Já Equipada!* Você já possui a *${runa.nome}* ativa em seu personagem.`);
            }

            if ((user.coins || 0) < runa.custo) {
                return reply(`❌ *Saldo Insuficiente!* Você precisa de *${formatCoins(runa.custo)}* para forjar e equipar esta runa (Seu saldo: ${formatCoins(user.coins || 0)}).`);
            }

            user.coins -= runa.custo;
            user.activeRunes.push({
                id: runa.id,
                nome: runa.nome,
                atk: runa.atk,
                def: runa.def,
                crit: runa.crit
            });
            user.active_runes = user.activeRunes;

            await dataService.saveXpData(xpData);

            const stats = calculateFullCharacterStats(user);

            return reply(`🎉 *${runa.emoji} RUNA SAGRADA EQUIPADA COM SUCESSO!*\n\n✨ *${runa.nome}* foi incrustada em sua armadura!\n💥 *Bônus Ativo:* ${runa.bonus}\n⚔️ *Novo Ataque Total:* **${stats.atk} ATK**\n🛡️ *Nova Defesa Total:* **${stats.def} DEF**\n💰 *Investimento:* ${formatCoins(runa.custo)}`);
        }

        // 2. DESEQUIPAR
        if (sub === "desequipar" || sub === "remover") {
            if (user.activeRunes.length === 0) {
                return reply("❌ Você não possui nenhuma runa equipada para remover.");
            }
            user.activeRunes = [];
            user.active_runes = [];
            await dataService.saveXpData(xpData);
            return reply("🧹 *Todas as runas foram desequipadas com sucesso!*");
        }

        // 3. EXIBIÇÃO / CATÁLOGO
        const fields = Object.entries(RUNAS_INFO).map(([key, info]) => {
            const isEquipped = user.activeRunes.some(r => (typeof r === 'string' ? r === key : r.id === key));
            const tag = isEquipped ? " 🟢 *(Equipada)*" : ` ➔ \`.runas equipar ${key}\``;
            return `${info.emoji} *${info.nome}*${tag}\n   ├ 💥 *Bônus:* ${info.bonus}\n   └ 💰 *Custo:* ${formatCoins(info.custo)}`;
        });

        const userRunas = user.activeRunes.length > 0 
            ? user.activeRunes.map(r => {
                const key = typeof r === 'string' ? r : r.id;
                return `• ${RUNAS_INFO[key]?.emoji || "🔮"} *${RUNAS_INFO[key]?.nome || r.nome || key}* (+${RUNAS_INFO[key]?.atk || 0} ATK)`;
            }).join("\n")
            : "_Nenhuma runa equipada ainda._";

        const card = renderCard({
            title: "ALTAR DE RUNAS SAGRADAS",
            icon: "🔮",
            subtitle: `🧙 *Guerreiro:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "SUAS RUNAS ATIVAS NO CORPO",
                    icon: "🛡️",
                    fields: [userRunas]
                },
                {
                    title: "CATÁLOGO DE RUNAS ELEMENTAIS",
                    icon: "📜",
                    fields: fields
                }
            ],
            tip: "Use .runas equipar <fogo|raio|trevas|luz> para forjar e ativar os bônus!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};
