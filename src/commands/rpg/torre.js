/**
 * Comando .torre — Torre dos Desafios, INFINITA.
 *
 * Antes: teto rígido de 100 andares (`Math.min(100, ...)`), 70% de vitória fixa
 * em qualquer andar e recompensa linear — o andar 99 valia quase o mesmo que o 5
 * e, ao chegar em 100, a progressão simplesmente parava.
 *
 * Agora:
 *  - Sem teto: os andares seguem indefinidamente.
 *  - Dificuldade real: cada andar exige um CP mínimo que cresce; a chance de
 *    vitória sai da comparação entre o SEU poder e a exigência do andar.
 *  - Recompensa proporcional ao XP do próximo nível E ao andar, para continuar
 *    valendo a pena no andar 10 e no 5.000.
 *  - Marcos a cada 10 andares: bônus de coins e equipamento garantido.
 */

const dataService = require("../../services/dataService");
const { initializeUser, calcularXpNecessario, adicionarXp } = require("../../services/xpService");
const { calculateCharacterStats, sortearEquipamentoDrop } = require("../../services/rpgEquipmentService");
const { formatNumber, moedas, linhasSubiuNivel } = require("../../utils/textoRpg");
const logger = require("../../core/logger");
const F = require("../../utils/formato");

/** CP exigido pelo andar — cresce rápido, mas sem explodir. */
function exigenciaDoAndar(andar) {
    return Math.floor(80 * Math.pow(andar, 1.28) + andar * 45);
}

/** Chance de vitória a partir do seu poder x exigência (entre 12% e 93%). */
function chanceVitoria(cp, exigencia) {
    const razao = cp / Math.max(1, exigencia);
    const bruta = 0.15 + razao * 0.55;
    return Math.max(0.12, Math.min(0.93, bruta));
}

module.exports = {
    name: "torre",
    aliases: ["torredesafios", "escalar"],
    category: "rpg",
    subcategory: "Progressão",
    description: "Escale a Torre dos Desafios — andares infinitos, cada um mais difícil",
    cooldownMs: 4000,
    examples: [" — enfrenta o guardião do seu andar atual"],
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const andar = Math.max(1, user.towerFloor || 1);
        const exigencia = exigenciaDoAndar(andar);
        const stats = calculateCharacterStats(user);
        const cp = stats.cp || 1;
        const chance = chanceVitoria(cp, exigencia);
        const venceu = Math.random() < chance;

        const nivel = user.level || 1;
        // Escala com o NÍVEL (para não virar migalha no endgame) e com o ANDAR.
        const xpBase = Math.floor(calcularXpNecessario(nivel) * 0.05 * (1 + andar / 40)) + andar * 60;
        const coinsReward = Math.floor(andar * 260 + 500 + nivel * 25);

        if (!venceu) {
            user.towerRecorde = Math.max(user.towerRecorde || 0, andar - 1);
            dataService.saveUser(user);
            const doc = F.tela({
                emoji: "💀",
                titulo: `O guardião do andar ${formatNumber(andar)} venceu`,
                intro: "Você não perdeu nada: o andar continua esperando por você.",
                secoes: [
                    { emoji: "⚖️", titulo: "Comparação de forças", linhas: [
                        F.campo("Seu poder", formatNumber(cp)),
                        F.campo("Poder exigido", formatNumber(exigencia)),
                        F.barra(Math.min(1, cp / Math.max(1, exigencia))),
                        F.campo("Sua chance era", `${Math.round(chance * 100)}%`)
                    ] },
                    { emoji: "🏅", titulo: "Sua escalada", linhas: [
                        F.campo("Andar atual", formatNumber(andar)),
                        F.campo("Recorde", `andar ${formatNumber(user.towerRecorde || 0)}`)
                    ] }
                ],
                dica: "Quando seu poder alcança o exigido, a chance de vencer passa de 70%.",
                proximos: [
                    { nome: "torre", oque: "tentar o andar de novo" },
                    { nome: "forjar", oque: "fortalecer seus equipamentos" },
                    { nome: "shoparmaduras", oque: "comprar uma armadura melhor" }
                ]
            });
            return reply(doc.trim());
        }

        user.towerFloor = andar + 1;
        user.towerRecorde = Math.max(user.towerRecorde || 0, andar);
        const { xpGanho: xpReward, lvlRes } = adicionarXp(user, xpBase, { source: "rpg" });
        user.coins = (user.coins || 0) + coinsReward;

        // Marco a cada 10 andares: bônus + equipamento garantido.
        const marco = andar % 10 === 0;
        let bonusCoins = 0;
        if (marco) {
            bonusCoins = andar * 900 + 3000;
            user.coins += bonusCoins;
        }

        // Equipamento: garantido no marco, 12% nos demais andares.
        let drop = null;
        const cabeMochila = (user.inventario || []).length < (user.mochila || 20);
        if (cabeMochila && (marco || Math.random() < 0.12)) {
            drop = sortearEquipamentoDrop(nivel + Math.floor(andar / 5));
            if (drop) {
                if (!Array.isArray(user.inventario)) user.inventario = [];
                user.inventario.push({ ...drop });
            }
        }

        dataService.saveUser(user);
        logger.info(`[TORRE] ${sender} conquistou o andar ${andar}`);

        const proximoExige = exigenciaDoAndar(andar + 1);
        const linhasDrop = drop
            ? [`${drop.raridade} *${drop.nome}*`, `ATK +${formatNumber(drop.atk)} · DEF +${formatNumber(drop.def)} · ${formatNumber(drop.cp)} de poder`, `Vista com ${F.cmd(".", "equipar", drop.id)}`]
            : (!cabeMochila ? ["Nenhum: sua mochila está cheia"] : []);
        const faltaMarco = 10 - (andar % 10);
        const doc = F.tela({
            emoji: "🏆",
            titulo: `Andar ${formatNumber(andar)} conquistado`,
            intro: `Você venceu o guardião e ganhou *+${formatNumber(xpReward)} XP* e *+${moedas(coinsReward + bonusCoins)}*.`,
            secoes: [
                { emoji: "📜", titulo: "Recompensas", linhas: [
                    F.campo("XP", `+${formatNumber(xpReward)}`),
                    F.campo("Moedas", `+${moedas(coinsReward)}`),
                    marco ? F.campo(`Bônus do marco ${formatNumber(andar)}`, `+${moedas(bonusCoins)}`) : "",
                    F.campo("Chance que você tinha", `${Math.round(chance * 100)}%`)
                ] },
                { emoji: "🆙", titulo: "Subiu de nível", linhas: linhasSubiuNivel(user, lvlRes) },
                { emoji: "🎁", titulo: marco ? "Equipamento do marco" : "Equipamento encontrado", linhas: linhasDrop },
                { emoji: "🗼", titulo: "Próximo andar", linhas: [
                    F.campo("Andar", formatNumber(andar + 1)),
                    F.campo("Poder exigido", `${formatNumber(proximoExige)} (você tem ${formatNumber(cp)})`),
                    F.barra(Math.min(1, cp / Math.max(1, proximoExige))),
                    F.campo("Recorde", `andar ${formatNumber(user.towerRecorde || andar)}`)
                ] }
            ],
            dica: marco ? "A cada 10 andares vem bônus de moedas e um equipamento garantido." : `Faltam ${faltaMarco} andares para o próximo marco, com equipamento garantido.`,
            proximos: [
                { nome: "torre", oque: "subir mais um andar" },
                drop ? { nome: "equipar", args: drop.id, oque: "vestir o que caiu" } : { nome: "forjar", oque: "ficar mais forte" }
            ]
        });
        return reply(doc.trim());
    }
};
