/**
 * Comando .forjar / .upgrade / .aprimorar / .refinar
 * Sistema de aprimoramento de equipamentos com progressão dinâmica, upgrades múltiplos e exibição de atributos totais reais
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { calculateCharacterStats, getItem } = require("../../services/rpgEquipmentService");
const { formatNumber, moedas, plural } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

/** Teto de segurança do laço de forja — ver comentário abaixo. */
const TETO_SEGURANCA = 100000;

/** Fração do saldo que o modo ultramax reserva para a forja. */
const ULTRAMAX_FRACAO = 0.70;

/** Pontos percentuais de garantia ganhos a cada 1000 níveis de personagem. */
const BUFF_FORJA_POR_MILHAR = 3;

/**
 * Alias do teto de segurança para o ULTRAMAX. Quem encerra o modo é o orçamento (70% do
 * saldo), não uma contagem estimada: como cada falha cobra sem subir de nível,
 * uma contagem pré-calculada sobraria dinheiro na mesa. Este número existe só
 * para o laço não correr solto se o custo por nível ficar irrisório.
 */
const ULTRAMAX_TETO_TENTATIVAS = TETO_SEGURANCA;

/**
 * Teto de segurança, não de jogo.
 *
 * Quem realmente limita a forja é o DINHEIRO: cada nível custa mais que o
 * anterior, então o orçamento se esgota sozinho e o laço termina. Este número
 * existe só para o laço não correr solto num cenário absurdo — e é alto o
 * bastante para nunca ser o que barra um jogador de verdade.
 */

function getCostForLevel(targetLevel) {
    // Escala progressiva de custo por nível de forja
    return Math.floor(400 + (targetLevel * 350) + Math.pow(targetLevel, 1.4) * 80);
}

/** Chance de acerto da próxima martelada, a mesma fórmula usada no laço. */
function chanceDeAcerto(nivelForja, nivelPersonagem) {
    const buffForja = Math.floor(Number(nivelPersonagem || 1) / 1000) * BUFF_FORJA_POR_MILHAR;
    return Math.min(95, Math.max(40, 95 - (nivelForja * 4)) + buffForja);
}

/** Aviso de saldo curto, igual para todos os modos. */
function faltaDinheiro(custo, saldo, nivel, p = ".") {
    const faltam = Math.max(0, custo - saldo);
    return F.tela({
        emoji: "🪙",
        titulo: "Moedas insuficientes para forjar",
        intro: `Faltam *${moedas(faltam)}* para levar sua forja ao nível *+${nivel}*.`,
        secoes: [{ emoji: "💰", titulo: "Contas do ferreiro", linhas: [
            F.campo(`Custo do +${nivel}`, moedas(custo)),
            F.campo("Seu saldo", moedas(saldo)),
            F.campo("Faltam", moedas(faltam))
        ] }],
        dica: "A masmorra é o lugar que mais paga moedas para quem já tem algum poder.",
        prefix: p,
        proximos: [
            { nome: "dungeon", oque: "juntar moedas na masmorra" },
            { nome: "hunt", oque: "caçar monstros por moedas" },
            { nome: "trabalhar", oque: "ganhar moedas trabalhando" }
        ]
    });
}

module.exports = {
    name: "forjar",
    aliases: ["upgrade", "aprimorar", "refinar", "upgradearma", "upgradearmadura"],
    category: "rpg",
    subcategory: "Equipamento & Forja",
    description: "Leve seu equipamento ao ferreiro para ganhar ataque, defesa, vida e poder",
    usage: "[quantidade | max | ultramax]",
    examples: [
        " — tenta subir 1 nível de forja",
        "5 — tenta 5 níveis seguidos, até onde as moedas pagarem",
        "max — forja até acabar o saldo",
        "ultramax — forja usando só 70% do saldo"
    ],
    cooldownMs: 3000,
    execute: async ({ sender, reply, args, text, prefix }) => {
        const p = prefix || ".";
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        let currentLvl = Number(user.forgeLevel || 0);

        // "ultramax" precisa ser detectado ANTES do "max": o regex de max casa com
        // a própria palavra "ultraMAX", e sem esta checagem o modo cairia no
        // comportamento de gastar o saldo inteiro.
        const ehUltraMax = args.some(a => /^ultra_?max$/i.test(String(a).trim()));

        // Identificação de quantidade de upgrades solicitada
        let countRequested = 1;
        const argNum = args.find(a => /^\d+$/.test(a));
        if (argNum) {
            // Sem teto artificial: o orçamento barra quando o dinheiro acabar.
            countRequested = Math.min(TETO_SEGURANCA, Math.max(1, parseInt(argNum, 10)));
        } else if (ehUltraMax || args.some(a => /max|tudo|todos/i.test(a))) {
            // ULTRAMAX reserva exatamente 70% do saldo, seja ele qual for, e forja
            // até onde esse orçamento alcançar. MAX continua usando o saldo inteiro.
            const saldo = user.coins || 0;
            let tempCoins = ehUltraMax ? Math.floor(saldo * ULTRAMAX_FRACAO) : saldo;
            let tempLvl = currentLvl;
            countRequested = 0;
            while (countRequested < TETO_SEGURANCA) {
                const nextCost = getCostForLevel(tempLvl + 1);
                if (tempCoins >= nextCost) {
                    tempCoins -= nextCost;
                    tempLvl++;
                    countRequested++;
                } else {
                    break;
                }
            }
            // Em MAX e ULTRAMAX quem manda parar é o ORÇAMENTO, não esta contagem.
            // Ela foi calculada supondo só sucessos; como cada falha cobra sem subir
            // de nível, usá-la deixava dinheiro na mesa — o max chegava a gastar
            // menos que o ultramax, que reserva apenas 70%.
            if (countRequested > 0) countRequested = TETO_SEGURANCA;
            if (countRequested === 0) {
                const nextCost = getCostForLevel(currentLvl + 1);
                if (ehUltraMax) {
                    const reservado = Math.floor((user.coins || 0) * ULTRAMAX_FRACAO);
                    const saldoPaga = (user.coins || 0) >= nextCost;
                    return reply(F.tela({
                        emoji: "🪙",
                        titulo: "O ultramax não alcança o próximo nível",
                        intro: `O ultramax usa só 70% do seu saldo (*${moedas(reservado)}*), e o nível +${currentLvl + 1} custa *${moedas(nextCost)}*.`,
                        secoes: [{ emoji: "💰", titulo: "Contas do ferreiro", linhas: [
                            F.campo("Seu saldo", moedas(user.coins || 0)),
                            F.campo("70% do saldo", moedas(reservado)),
                            F.campo(`Custo do +${currentLvl + 1}`, moedas(nextCost))
                        ] }],
                        dica: saldoPaga
                            ? "Com o saldo inteiro dá para pagar este nível: use o modo max."
                            : "Nem o saldo inteiro paga este nível ainda. Junte mais moedas antes.",
                        prefix: p,
                        proximos: [
                            saldoPaga ? { nome: "forjar", args: "max", oque: "forjar com o saldo inteiro" } : null,
                            { nome: "dungeon", oque: "juntar moedas na masmorra" },
                            { nome: "hunt", oque: "caçar monstros por moedas" }
                        ].filter(Boolean)
                    }));
                }
                return reply(faltaDinheiro(nextCost, user.coins || 0, currentLvl + 1, p));
            }
        }

        // Teto de gasto desta forja. No ULTRAMAX é 70% do saldo — o resto do
        // dinheiro fica intocado de propósito; nos demais modos, o saldo inteiro.
        const orcamento = ehUltraMax
            ? Math.floor((user.coins || 0) * ULTRAMAX_FRACAO)
            : (user.coins || 0);

        // Simulação e cálculo de custo e sucessos
        let totalCost = 0;
        let sucessos = 0;
        let falhas = 0;
        let simLvl = currentLvl;

        for (let i = 0; i < countRequested; i++) {
            const nextLvl = simLvl + 1;
            const cost = getCostForLevel(nextLvl);

            if (orcamento < totalCost + cost) {
                if (i === 0) {
                    return reply(faltaDinheiro(cost, user.coins || 0, nextLvl, p));
                }
                break; // Para no limite que as moedas conseguiram pagar
            }

            totalCost += cost;

            // Chance de sucesso cai conforme o nível de forja sobe, mas o nível do
            // PERSONAGEM devolve garantia: +3% a cada 1000 níveis. Teto em 95% para
            // a forja nunca virar sucesso automático.
            const successRate = chanceDeAcerto(simLvl, user.level);
            const roll = Math.floor(Math.random() * 100) + 1;

            if (roll <= successRate) {
                sucessos++;
                simLvl++;
            } else {
                falhas++;
            }
        }

        // Aplica o débito de moedas e a evolução
        user.coins = Math.max(0, (user.coins || 0) - totalCost);
        const previousLvl = currentLvl;
        user.forgeLevel = simLvl;

        dataService.saveXpData(xpData);

        // Recalcula atributos totais reais com a nova forja
        const stats = calculateCharacterStats(user);

        const armaRef = user.slots?.arma || user.arma || user.equipado;
        const armaNome = armaRef ? (typeof armaRef === 'object' ? armaRef.nome : (getItem(armaRef)?.nome || user.arma || "Espada de Ferro")) : "Punhos";

        const tentativas = sucessos + falhas;
        let emoji, titulo, intro;
        if (sucessos > 0) {
            emoji = "🔨";
            titulo = `Forja subiu para +${user.forgeLevel}`;
            intro = `O ferreiro acertou ${plural(sucessos, "martelada", "marteladas")} e sua forja foi de +${previousLvl} para *+${user.forgeLevel}*, por *${moedas(totalCost)}*.`;
            if (falhas > 0) intro += ` No caminho, ${plural(falhas, "tentativa trincou", "tentativas trincaram")} o metal.`;
        } else {
            emoji = "💥";
            titulo = "O metal trincou";
            intro = `${falhas === 1 ? "A tentativa falhou" : `As ${formatNumber(falhas)} tentativas falharam`} e sua forja continua em *+${user.forgeLevel}*. Você pagou *${moedas(totalCost)}* mesmo assim.`;
        }

        const proximoCusto = getCostForLevel(user.forgeLevel + 1);
        const proximaChance = chanceDeAcerto(user.forgeLevel, user.level);
        const bateuTeto = ehUltraMax && tentativas >= ULTRAMAX_TETO_TENTATIVAS;

        const doc = F.tela({
            emoji,
            titulo,
            intro,
            secoes: [
                { emoji: "⚔️", titulo: `Equipamento +${user.forgeLevel}`, linhas: [
                    F.campo("Arma", `${armaNome} +${user.forgeLevel}`),
                    F.campo("Ataque", `${formatNumber(stats.atk)} (+${formatNumber(sucessos * 50)} desta forja)`),
                    F.campo("Defesa", `${formatNumber(stats.def)} (+${formatNumber(sucessos * 35)} desta forja)`),
                    F.campo("Vida máxima", `${formatNumber(stats.hpMax)} HP (+${formatNumber(sucessos * 120)} desta forja)`),
                    F.campo("Poder de combate", `${formatNumber(stats.cp)} (+${formatNumber(sucessos * 250)})`),
                    `${F.campo("Crítico", `${stats.crit}%`)} · ${F.campo("Esquiva", `${stats.esq}%`)}`
                ] },
                { emoji: "💰", titulo: "Contas da forja", linhas: [
                    F.campo("Tentativas", `${formatNumber(tentativas)} (${plural(sucessos, "certa", "certas")}, ${plural(falhas, "trincada", "trincadas")})`),
                    F.campo("Gasto", `${moedas(totalCost)}${ehUltraMax ? ` de um orçamento de ${moedas(orcamento)} (70% do saldo)` : ""}`),
                    F.campo("Saldo", moedas(user.coins || 0)),
                    F.campo(`Próximo nível (+${user.forgeLevel + 1})`, `${moedas(proximoCusto)} · ${proximaChance}% de acerto`),
                    bateuTeto ? `Você chegou ao limite de ${formatNumber(TETO_SEGURANCA)} forjas de uma vez. Use o ultramax de novo para continuar.` : null
                ] }
            ],
            dica: falhas > 0
                ? "Quanto mais alta a forja, menor a chance de acerto, e tentativa trincada também cobra. Cada 1000 níveis de personagem devolvem +3% de acerto."
                : "Cada nível de forja soma +50 de ataque, +35 de defesa, +120 de vida e +250 de poder.",
            prefix: p,
            proximos: [
                { nome: "forjar", args: "5", oque: "tentar 5 níveis de uma vez" },
                { nome: "forjar", args: "max", oque: "gastar o saldo inteiro" },
                { nome: "forjar", args: "ultramax", oque: "gastar só 70% do saldo" },
                { nome: "dungeon", oque: "testar o novo poder" }
            ]
        });

        return reply(doc);
    }
};
