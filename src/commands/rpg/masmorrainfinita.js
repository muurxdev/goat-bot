const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .masmorrainfinita / .torreinfinita — Torre Infinita de Reino.
 *
 * Os andares nunca acabam (o cabeçalho antigo dizia "1 ao 100", o que já não era
 * verdade). O que faltava era CONSEQUÊNCIA: a chance de vitória era fixa em 65%
 * no andar 3 e no 3.000, e a recompensa era linear — o andar alto não valia mais
 * esforço que o baixo.
 *
 * Agora a dificuldade sai do seu CP contra a exigência do andar, e a recompensa
 * acompanha o nível E o andar. Marcos a cada 25 andares dão equipamento garantido.
 */

const { renderCard, formatCoins, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
const { initializeUser, calcularXpNecessario, adicionarXp } = require("../../services/xpService");
const { calculateCharacterStats, sortearEquipamentoDrop } = require("../../services/rpgEquipmentService");
const logger = require("../../core/logger");

/** Exigência de CP do andar (um pouco mais dura que a Torre dos Desafios). */
function exigenciaDoAndar(andar) {
    return Math.floor(100 * Math.pow(andar, 1.34) + andar * 60);
}

function chanceVitoria(cp, exigencia) {
    const razao = cp / Math.max(1, exigencia);
    return Math.max(0.10, Math.min(0.92, 0.14 + razao * 0.56));
}

module.exports = {
    name: "masmorrainfinita",
    aliases: ["torreinfinita", "andartorre", "escalartorre"],
    category: "rpg",
    subcategory: "Progressão",
    description: "Escale a Torre Infinita de Reino — andares sem fim, cada um mais difícil",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        user.rpg = user.rpg || {};
        user.rpg.andarTorre = Math.max(1, user.rpg.andarTorre || 1);

        const andar = user.rpg.andarTorre;
        const exigencia = exigenciaDoAndar(andar);
        const stats = calculateCharacterStats(user);
        const cp = stats.cp || 1;
        const chance = chanceVitoria(cp, exigencia);
        const vitoria = Math.random() < chance;

        if (!vitoria) {
            user.rpg.recordeTorre = Math.max(user.rpg.recordeTorre || 0, andar - 1);
            dataService.saveUser(user);
            return reply(
                `💀 *DERROTA NO ANDAR ${andar.toLocaleString("pt-BR")}!*\n\n` +
                `⚡ *Seu CP:* ${cp.toLocaleString("pt-BR")} | 🛡️ *Exigido:* ${exigencia.toLocaleString("pt-BR")}\n` +
                `🎲 *Sua chance era de:* ${Math.round(chance * 100)}%\n\n` +
                `💡 _Fortaleça-se em_ \`.forjar\`_,_ \`.shoparmas\` _e_ \`.shoparmaduras\`_._`
            );
        }

        const nivel = user.level || 1;
        const baseXp = Math.floor(calcularXpNecessario(nivel) * 0.06 * (1 + andar / 35)) + andar * 80;
        const coinsGanho = Math.floor(andar * 300 + 600 + nivel * 30);

        const { xpGanho, lvlRes } = adicionarXp(user, baseXp, { source: "rpg" });
        user.coins = (user.coins || 0) + coinsGanho;
        user.rpg.andarTorre = andar + 1;
        user.rpg.recordeTorre = Math.max(user.rpg.recordeTorre || 0, andar);

        const marco = andar % 25 === 0;
        let drop = null;
        const cabeMochila = (user.inventario || []).length < (user.mochila || 20);
        if (cabeMochila && (marco || Math.random() < 0.15)) {
            drop = sortearEquipamentoDrop(nivel + Math.floor(andar / 4));
            if (drop) {
                if (!Array.isArray(user.inventario)) user.inventario = [];
                user.inventario.push({ ...drop });
            }
        }

        dataService.saveUser(user);
        logger.info(`[TORRE INFINITA] ${sender} conquistou o andar ${andar}`);

        const campos = [
            { label: "Andar Conquistado", value: `Andar ${andar.toLocaleString("pt-BR")} (Guardião Derrotado)`, icon: "🗡️" },
            { label: "Seu Poder", value: `${cp.toLocaleString("pt-BR")} CP (exigia ${exigencia.toLocaleString("pt-BR")})`, icon: "⚡" },
            { label: "Recompensas", value: `+${formatXP(xpGanho)} | +${formatCoins(coinsGanho)}`, icon: "🎁" },
            { label: "Próximo Desafio", value: `Andar ${(andar + 1).toLocaleString("pt-BR")} — exige ${exigenciaDoAndar(andar + 1).toLocaleString("pt-BR")} CP`, icon: "🚪" },
            { label: "Seu Recorde", value: `Andar ${(user.rpg.recordeTorre || andar).toLocaleString("pt-BR")}`, icon: "🏅" }
        ];
        if (lvlRes.subiu) {
            campos.push({ label: "Subiu de nível", value: `agora nível ${user.level}`, icon: "🆙" });
        }
        if (drop) {
            campos.push({ label: marco ? "Equipamento do Marco" : "Equipamento Encontrado", value: `${drop.raridade} ${drop.nome} (+${drop.cp} CP) — \`.equipar ${drop.id}\``, icon: "✨" });
        }

        const card = renderCard({
            title: `TORRE INFINITA — ANDAR ${andar.toLocaleString("pt-BR")} CONQUISTADO!`,
            icon: "🗼",
            subtitle: `⚔️ *Conquistador:* ${nomeDoMembro(sender)}`,
            sections: [{ title: "RESULTADO DA ESCALADA", icon: "🏆", fields: campos }],
            tip: marco ? `Marco de ${andar} andares! Equipamento garantido concedido.` : "A torre não tem topo — cada andar exige mais CP que o anterior.",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};
