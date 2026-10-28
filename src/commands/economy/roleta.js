/**
 * Comando .roleta
 * Roleta Clássica de Cassino com Probabilidade Matemática Justa e Multiplicadores Reais
 */

const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { moedas, marcar } = require("../../utils/textoRpg")
const logger = require("../../core/logger")
const F = require("../../utils/formato")

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
const COOLDOWN_MS = 3000
const MAX_BET = 500000

// Roleta europeia: 37 casas (0 a 36). Só para exibir as chances.
const CHANCES = {
    vermelho: { mult: 2, chance: "48,6%" },
    preto: { mult: 2, chance: "48,6%" },
    verde: { mult: 14, chance: "2,7%" },
    numero: { mult: 36, chance: "2,7%" }
}

const TABELA = [
    "• 🔴 *vermelho* — paga 2x (chance de 48,6%)",
    "• ⚫ *preto* — paga 2x (chance de 48,6%)",
    "• 🟢 *verde* ou *0* — paga 14x (chance de 2,7%)",
    "• 🔢 *número de 1 a 36* — paga 36x (chance de 2,7%)"
]

module.exports = {
    name: "roleta",
    aliases: ["roulette","roletacassino","apostar-roleta","cmd_roleta","alt_roleta","atalho_roleta","abrev_roleta","call_roleta","func_roleta"],
    category: "economy",
    subcategory: "Jogos",
    description: "Aposte suas moedas na Roleta Europeia (0-36, Vermelho, Preto ou Verde)",
    usage: "<valor> <vermelho|preto|verde|0-36>",
    examples: [
        "500 vermelho — aposta 500 moedas no vermelho (paga 2x)",
        "200 7 — aposta 200 moedas no número 7 (paga 36x)",
        "100 verde — aposta 100 moedas no zero (paga 14x)"
    ],
    cooldownMs: COOLDOWN_MS,
    execute: async ({ sender, args, reply, prefix = "." }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const carteira = user.coins || 0

        const exemplos = [
            `• ${F.cmd(prefix, "roleta", "500 vermelho")} — aposta 500 moedas no vermelho`,
            `• ${F.cmd(prefix, "roleta", "200 7")} — aposta 200 moedas no número 7`,
            `• ${F.cmd(prefix, "roleta", "100 verde")} — aposta 100 moedas no zero`
        ]

        if (!args[0] || !args[1]) {
            return reply(F.tela({
                emoji: "🎡",
                titulo: "Roleta da taverna",
                intro: /^\d+$/.test(args[0] || "")
                    ?`Faltou dizer onde apostar as ${args[0]} moedas: uma cor ou um número.`
                    : "Escolha quanto apostar e onde: uma cor ou um número de 0 a 36.",
                secoes: [
                    { emoji: "✍️", titulo: "Digite assim", linhas: exemplos },
                    { emoji: "🎲", titulo: "Apostas e prêmios", linhas: TABELA },
                    { emoji: "💳", titulo: "Você", linhas: [
                        F.campo("Carteira", moedas(carteira)),
                        F.campo("Aposta máxima", moedas(MAX_BET))
                    ] }
                ],
                dica: "Cor paga pouco e acerta quase metade das vezes. Número paga muito e acerta raramente.",
                prefix
            }))
        }

        const betAmount = parseInt(args[0], 10)
        if (isNaN(betAmount) || betAmount <= 0) {
            return reply(F.tela({
                emoji: "🔢",
                titulo: "Valor não entendido",
                intro: `"${args[0]}" não é um valor de aposta. Primeiro vem o valor, depois a cor ou o número.`,
                secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: exemplos }],
                dica: `Sua carteira tem ${moedas(carteira)}.`,
                prefix
            }))
        }

        const maxBet = MAX_BET
        if (betAmount > maxBet) {
            return reply(F.tela({
                emoji: "🎡",
                titulo: "Aposta acima do limite",
                intro: `A roleta aceita no máximo *${moedas(maxBet)}* por aposta. Você tentou *${moedas(betAmount)}*.`,
                proximos: [{ nome: "roleta", args: `${Math.min(maxBet, carteira) || 100} ${args[1]}`, oque: "apostar dentro do limite" }],
                prefix
            }))
        }

        if (carteira < betAmount) {
            return reply(F.tela({
                emoji: "🪙",
                titulo: "Moedas insuficientes",
                intro: `Você quer apostar *${moedas(betAmount)}*, mas tem *${moedas(carteira)}* na carteira.`,
                secoes: [{ emoji: "💳", titulo: "Seu dinheiro", linhas: [
                    F.campo("Carteira", moedas(carteira)),
                    F.campo("Cofre", moedas(user.bank || 0))
                ] }],
                proximos: [
                    carteira > 0 ? { nome: "roleta", args: `${carteira} ${args[1]}`, oque: "apostar tudo o que tem na carteira" } : { nome: "trabalhar", oque: "ganhar moedas" },
                    (user.bank || 0) > 0 ? { nome: "banco", args: "sacar <valor>", oque: "trazer moedas do cofre" } : null
                ].filter(Boolean),
                prefix
            }))
        }
        const choiceRaw = args[1].toLowerCase().trim()
        let betType = ""
        let chosenNumber = null

        if (choiceRaw === "vermelho" || choiceRaw === "red" || choiceRaw === "v") {
            betType = "vermelho"
        } else if (choiceRaw === "preto" || choiceRaw === "black" || choiceRaw === "p") {
            betType = "preto"
        } else if (choiceRaw === "verde" || choiceRaw === "green" || choiceRaw === "zero" || choiceRaw === "0") {
            betType = "verde"
            chosenNumber = 0
        } else {
            const num = parseInt(choiceRaw, 10)
            if (!isNaN(num) && num >= 0 && num <= 36) {
                betType = num === 0 ? "verde" : "numero"
                chosenNumber = num
            } else {
                return reply(F.tela({
                    emoji: "🎡",
                    titulo: "Aposta não reconhecida",
                    intro: `"${args[1]}" não é uma casa da roleta. Escolha *vermelho*, *preto*, *verde* ou um número de *0 a 36*.`,
                    secoes: [
                        { emoji: "🎲", titulo: "Apostas e prêmios", linhas: TABELA },
                        { emoji: "✍️", titulo: "Digite assim", linhas: exemplos }
                    ],
                    prefix
                }))
            }
        }

        // Sorteio justo da Roleta Europeia (0 a 36)
        const drawnNumber = Math.floor(Math.random() * 37)
        let drawnColor = "🟢 Verde"
        if (RED_NUMBERS.includes(drawnNumber)) drawnColor = "🔴 Vermelho"
        else if (BLACK_NUMBERS.includes(drawnNumber)) drawnColor = "⚫ Preto"

        let won = false
        let multiplier = 0

        if (betType === "vermelho" && RED_NUMBERS.includes(drawnNumber)) {
            won = true
            multiplier = 2
        } else if (betType === "preto" && BLACK_NUMBERS.includes(drawnNumber)) {
            won = true
            multiplier = 2
        } else if (betType === "verde" && drawnNumber === 0) {
            won = true
            multiplier = 14
        } else if (betType === "numero" && drawnNumber === chosenNumber) {
            won = true
            multiplier = 36
        }

        let profit = 0
        if (won) {
            profit = (betAmount * multiplier) - betAmount
            user.coins = (user.coins || 0) + profit
        } else {
            user.coins = Math.max(0, (user.coins || 0) - betAmount)
        }

        await dataService.saveXpData(xpData)
        logger.info("[ROLETA] " + sender + " apostou " + betAmount + " em " + betType + " e " + (won ? "VENCEU +" + profit : "PERDEU"))

        const escolhaTxt = betType === "numero" ? `número ${chosenNumber}` : (betType === "verde" ? "verde (0)" : betType)
        const info = CHANCES[betType]
        const lucroTxt = won ? `+${moedas(profit)}` : `−${moedas(betAmount)}`

        return reply(F.tela({
            emoji: won ? "🎉" : "🎡",
            titulo: won ? `Deu ${drawnNumber}: você ganhou` : `Deu ${drawnNumber}: não foi desta vez`,
            intro: `A roleta parou no *${drawnNumber} (${drawnColor})*.\n\n` + (won
                ? `${marcar(sender)}, sua aposta em ${escolhaTxt} pagou *${multiplier}x*: lucro de *${moedas(profit)}*.`
                : `${marcar(sender)}, sua aposta de *${moedas(betAmount)}* em ${escolhaTxt} ficou com a casa.`),
            secoes: [{ emoji: "📋", titulo: "Aposta", linhas: [
                F.campo("Sua escolha", escolhaTxt),
                F.campo("Valor", moedas(betAmount)),
                F.campo("Chance", `${info.chance} · paga ${info.mult}x`),
                F.campo("Resultado", lucroTxt),
                F.campo("Carteira", `${moedas(carteira)} → *${moedas(user.coins || 0)}*`),
                F.campo("Pode girar de novo em", F.tempo(COOLDOWN_MS))
            ] }],
            dica: won
                ? "Guarde o lucro no cofre antes de girar de novo."
                : "Cada giro é independente: o resultado anterior não muda a chance do próximo.",
            proximos: [
                (user.coins || 0) >= betAmount ? { nome: "roleta", args: `${betAmount} ${args[1]}`, oque: "repetir a aposta" } : { nome: "trabalhar", oque: "recuperar moedas sem risco" },
                won ? { nome: "banco", args: "depositar tudo", oque: "guardar o lucro" } : null
            ].filter(Boolean),
            prefix
        }), [sender])
    }
}
