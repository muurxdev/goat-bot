/**
 * Comando .cassino
 * Caça-níqueis animado (Slots 🎰) com multiplicadores de até 10x
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { moedas, marcar } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

const SYMBOLS = ["🍒", "🍋", "🍇", "🔔", "⭐", "💎", "7️⃣"];
const COOLDOWN_MS = 5000;
const APOSTA_PADRAO = 50;

// Probabilidades exatas dos três rolos independentes (7 símbolos cada), só
// para exibir. Trinca específica: 1/343. Qualquer trinca: 7/343. Par: 126/343.
const TABELA = [
    "• 7️⃣ 7️⃣ 7️⃣ — *10x* (chance de 0,3%)",
    "• 💎 💎 💎 — *8x* (chance de 0,3%)",
    "• ⭐ ⭐ ⭐ — *6x* (chance de 0,3%)",
    "• Outra trinca — *4x* (chance de 1,2%)",
    "• Um par — *2x* (chance de 36,7%)",
    "• Nada combina — perde a aposta (61,2%)"
];

module.exports = {
    name: "cassino",
    aliases: ["cacaniqueis","caca-niquel","jackpot","cmd_cassino","alt_cassino","atalho_cassino","abrev_cassino","call_cassino","func_cassino"],
    category: "economy",
    subcategory: "Jogos",
    description: "Aposte moedas no caça-níqueis da taverna, com prêmios de até 10x",
    usage: "[valor]",
    examples: [
        " — gira apostando 50 moedas",
        "500 — gira apostando 500 moedas"
    ],
    cooldownMs: COOLDOWN_MS,
    execute: async ({ sender, args, reply, prefix = "." }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        // Sem valor → aposta padrão de 50. Valor digitado que não é número inteiro
        // positivo (".cassino abc", ".cassino 0") → tela de uso, sem cobrar nada.
        // Antes o "|| 50" transformava qualquer erro de digitação numa aposta de 50.
        const semValor = !(args && args[0]);
        const digitado = semValor ? "" : String(args[0]).trim();
        const valido = semValor || /^\d+$/.test(digitado);
        const betAmount = semValor ? APOSTA_PADRAO : (valido ? parseInt(digitado, 10) : NaN);

        if (!valido || betAmount < 10) {
            return reply(F.tela({
                emoji: "🎰",
                titulo: !valido ? "Não entendi a aposta" : "Aposta baixa demais",
                intro: (!valido
                    ? `"${digitado.slice(0, 30)}" não é um valor de aposta. Use um número inteiro, a partir de *10 moedas*.`
                    : `A aposta mínima no caça-níqueis é *10 moedas*.`) + ` Nada foi cobrado; você tem *${moedas(user.coins || 0)}* na carteira.`,
                secoes: [
                    { emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "cassino", "100")} — aposta 100 moedas`,
                        `• ${F.cmd(prefix, "cassino")} — aposta 50 moedas`
                    ] },
                    { emoji: "🏆", titulo: "Prêmios", linhas: TABELA }
                ],
                prefix
            }));
        }

        if ((user.coins || 0) < betAmount) {
            const carteira = user.coins || 0;
            return reply(F.tela({
                emoji: "🪙",
                titulo: "Moedas insuficientes",
                intro: `A aposta é de *${moedas(betAmount)}*, mas você tem *${moedas(carteira)}* na carteira.`,
                secoes: [{ emoji: "💳", titulo: "Seu dinheiro", linhas: [
                    F.campo("Carteira", moedas(carteira)),
                    F.campo("Cofre", moedas(user.bank || 0))
                ] }],
                dica: carteira >= 10 ? "Aposte um valor que caiba na carteira." : "Junte moedas antes de voltar ao caça-níqueis.",
                proximos: [
                    carteira >= 10 ? { nome: "cassino", args: String(carteira), oque: "apostar tudo o que tem na carteira" } : { nome: "trabalhar", oque: "ganhar moedas" },
                    (user.bank || 0) > 0 ? { nome: "banco", args: "sacar <valor>", oque: "trazer moedas do cofre" } : null
                ].filter(Boolean),
                prefix
            }));
        }

        const carteiraAntes = user.coins;
        user.coins -= betAmount;

        const s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const s2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const s3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

        let multiplier = 0;
        let outcomeMsg = "";

        // 3 iguais
        if (s1 === s2 && s2 === s3) {
            if (s1 === "7️⃣") {
                multiplier = 10;
                outcomeMsg = "Três setes! O prêmio máximo";
            } else if (s1 === "💎") {
                multiplier = 8;
                outcomeMsg = "Três diamantes";
            } else if (s1 === "⭐") {
                multiplier = 6;
                outcomeMsg = "Três estrelas";
            } else {
                multiplier = 4;
                outcomeMsg = "Trinca";
            }
        }
        // 2 iguais
        else if (s1 === s2 || s2 === s3 || s1 === s3) {
            multiplier = 2;
            outcomeMsg = "Um par";
        } else {
            outcomeMsg = "Nenhuma combinação";
        }

        const winAmount = betAmount * multiplier;
        if (winAmount > 0) {
            user.coins += winAmount;
        }

        dataService.saveUser(user);

        const lucro = winAmount - betAmount;
        const ganhou = winAmount > 0;

        return reply(F.tela({
            emoji: "🎰",
            titulo: ganhou ? `${outcomeMsg}: ${multiplier}x` : "Não foi desta vez",
            intro: `[ ${s1} | ${s2} | ${s3} ]\n\n` + (ganhou
                ? `${marcar(sender)}, você apostou *${moedas(betAmount)}* e recebeu *${moedas(winAmount)}* (lucro de ${moedas(lucro)}).`
                : `${marcar(sender)}, nenhum símbolo combinou e a aposta de *${moedas(betAmount)}* ficou com a casa.`),
            secoes: [
                { emoji: "📋", titulo: "Rodada", linhas: [
                    F.campo("Aposta", moedas(betAmount) + (semValor ? " (valor padrão)" : "")),
                    F.campo("Multiplicador", ganhou ? `${multiplier}x` : "nenhum"),
                    F.campo("Prêmio", ganhou ? moedas(winAmount) : "nenhum"),
                    F.campo("Resultado", `${lucro >= 0 ? "+" : "−"}${moedas(Math.abs(lucro))}`),
                    F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins || 0)}*`),
                    F.campo("Pode girar de novo em", F.tempo(COOLDOWN_MS))
                ] },
                { emoji: "🏆", titulo: "Prêmios", linhas: TABELA }
            ],
            dica: ganhou
                ? "Quer garantir o lucro? Guarde no cofre antes da próxima rodada."
                : "Um par já devolve o dobro. Apostas menores fazem as moedas durarem mais rodadas.",
            proximos: [
                (user.coins || 0) >= betAmount ? { nome: "cassino", args: String(betAmount), oque: "girar de novo com o mesmo valor" } : null,
                ganhou ? { nome: "banco", args: "depositar tudo", oque: "guardar o prêmio no cofre" } : { nome: "trabalhar", oque: "recuperar moedas sem risco" }
            ].filter(Boolean),
            prefix
        }), [sender]);
    }
};
