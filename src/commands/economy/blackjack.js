/**
 * Comando .blackjack (21)
 * Jogo 21 Completo de Cassino com Cartas Interativas (Hit, Stand, Double Down)
 */

const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

const SUITS = ["♠️", "♥️", "♦️", "♣️"]
const VALUES = [
    { name: "2", val: 2 }, { name: "3", val: 3 }, { name: "4", val: 4 },
    { name: "5", val: 5 }, { name: "6", val: 6 }, { name: "7", val: 7 },
    { name: "8", val: 8 }, { name: "9", val: 9 }, { name: "10", val: 10 },
    { name: "J", val: 10 }, { name: "Q", val: 10 }, { name: "K", val: 10 },
    { name: "A", val: 11 }
]

function createDeck() {
    const deck = []
    for (const suit of SUITS) {
        for (const val of VALUES) {
            deck.push({ name: val.name, val: val.val, suit })
        }
    }
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
}

function calculateHand(cards) {
    let sum = 0
    let aces = 0
    for (const c of cards) {
        sum += c.val
        if (c.name === "A") aces++
    }
    while (sum > 21 && aces > 0) {
        sum -= 10
        aces--
    }
    return sum
}

function formatCards(cards, hideSecond = false) {
    if (hideSecond) {
        return `[${cards[0].name}${cards[0].suit}] [🂠 Oculta]`
    }
    return cards.map(c => `[${c.name}${c.suit}]`).join(" ")
}

const activeGames = new Map()

module.exports = {
    name: "blackjack",
    aliases: ["21","bj","jogar21","hit","stand","double","cmd_blackjack","alt_blackjack","atalho_blackjack","abrev_blackjack","call_blackjack","func_blackjack"],
    category: "economy",
    description: "Jogue o clássico Blackjack (21) contra o Dealer com apostas em Coins",
    cooldownMs: 1500,
    execute: async ({ sender, args, reply, commandName }) => {
        const botName = getBotName()
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const gameKey = sender

        const sub = (args[0] || commandName || "").toLowerCase().trim()

        // 1. AÇÃO HIT (Pedir Carta)
        if (sub === "hit" || sub === "pedir" || sub === "comprar" || commandName === "hit") {
            const game = activeGames.get(gameKey)
            if (!game) {
                return reply("❌ Você não possui uma partida de Blackjack ativa no momento.\n\nUse \`.blackjack <aposta>\` para começar!")
            }

            const card = game.deck.pop()
            game.playerCards.push(card)
            const score = calculateHand(game.playerCards)

            if (score > 21) {
                activeGames.delete(gameKey)
                user.coins = Math.max(0, (user.coins || 0) - game.bet)
                await dataService.saveXpData(xpData)

                let doc = "╔══════════════════════════════╗\n"
                doc += "║    🃏 *BLACKJACK — ESTOUROU!* 🃏    ║\n"
                doc += "╚══════════════════════════════╝\n\n"
                doc += "💥 *Você passou de 21 pontos (Bust)!*\n\n"
                doc += "🃏 *Suas Cartas:* " + formatCards(game.playerCards) + " (" + score + " pts)\n"
                doc += "🤖 *Dealer:* " + formatCards(game.dealerCards) + " (" + calculateHand(game.dealerCards) + " pts)\n\n"
                doc += "💸 *Prejuízo:* -" + game.bet.toLocaleString("pt-BR") + " Coins\n"
                doc += "💰 *Novo Saldo:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins"
                return reply(doc.trim(), [sender])
            }

            if (score === 21) {
                // Stand automático
                return resolveDealer(game, user, xpData, reply, sender, botName)
            }

            let doc = "╔══════════════════════════════╗\n"
            doc += "║      🃏 *BLACKJACK (21)* 🃏      ║\n"
            doc += "╚══════════════════════════════╝\n\n"
            doc += "🃏 *Suas Cartas:* " + formatCards(game.playerCards) + " (*" + score + " pts*)\n"
            doc += "🤖 *Dealer:* " + formatCards(game.dealerCards, true) + "\n"
            doc += "💰 *Aposta:* " + game.bet.toLocaleString("pt-BR") + " Coins\n\n"
            doc += "🎯 *Escolha sua próxima ação:*\n"
            doc += "👉 \`.blackjack hit\` — Pedir mais uma carta\n"
            doc += "👉 \`.blackjack stand\` — Parar e deixar o Dealer jogar"
            return reply(doc.trim(), [sender])
        }

        // 2. AÇÃO STAND (Parar e Deixar o Dealer Jogar)
        if (sub === "stand" || sub === "parar" || sub === "manter" || commandName === "stand") {
            const game = activeGames.get(gameKey)
            if (!game) {
                return reply("❌ Você não possui uma partida de Blackjack ativa.\n\nUse \`.blackjack <aposta>\` para começar!")
            }
            return resolveDealer(game, user, xpData, reply, sender, botName)
        }

        // 3. AÇÃO DOUBLE (Dobrar Aposta)
        if (sub === "double" || sub === "dobrar" || commandName === "double") {
            const game = activeGames.get(gameKey)
            if (!game) {
                return reply("❌ Você não possui uma partida de Blackjack ativa.")
            }
            if (game.playerCards.length !== 2) {
                return reply("❌ Só é possível dobrar a aposta na primeira rodada (com 2 cartas).")
            }
            if ((user.coins || 0) < game.bet * 2) {
                return reply("❌ Saldo insuficiente para dobrar a aposta!")
            }

            game.bet *= 2
            const card = game.deck.pop()
            game.playerCards.push(card)
            return resolveDealer(game, user, xpData, reply, sender, botName)
        }

        // 4. NOVA PARTIDA
        const betAmount = parseInt(args[0], 10)
        if (isNaN(betAmount) || betAmount <= 0) {
            let help = "╔══════════════════════════════╗\n"
            help += "║    🃏 *BLACKJACK CASSINO* 🃏    ║\n"
            help += "╚══════════════════════════════╝\n\n"
            help += "📌 *Como Jogar:* \`.blackjack <aposta>\`\n\n"
            help += "╭━〔 📜 REGRAS & PAGAMENTOS 〕━⬣\n"
            help += "┃ 🎯 Objetivo: Somar o mais próximo de 21 sem ultrapassar\n"
            help += "┃ 👑 *Blackjack Natural (21):* Paga 2.5x a aposta\n"
            help += "┃ 🏆 *Vitória contra o Dealer:* Paga 2x a aposta\n"
            help += "┃ 🤝 *Empate (Push):* Devolve o valor apostado\n"
            help += "╰━━━━━━━━━━━━━━━━━━⬣\n\n"
            help += "🎮 *Comandos da Partida:*\n"
            help += "• \`.hit\` — Pedir outra carta\n"
            help += "• \`.stand\` — Parar com suas cartas\n"
            help += "• \`.double\` — Dobrar aposta e pegar só 1 carta\n\n"
            help += "💰 *Seu Saldo:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins"
            return reply(help.trim())
        }

        if ((user.coins || 0) < betAmount) {
            return reply("❌ *Saldo insuficiente!* Você possui *" + (user.coins || 0).toLocaleString("pt-BR") + " Coins*.")
        }

        const maxBet = 500000
        if (betAmount > maxBet) {
            return reply("❌ A aposta máxima permitida no Blackjack é de " + maxBet.toLocaleString("pt-BR") + " Coins.")
        }

        const deck = createDeck()
        const playerCards = [deck.pop(), deck.pop()]
        const dealerCards = [deck.pop(), deck.pop()]

        const game = {
            bet: betAmount,
            deck,
            playerCards,
            dealerCards,
            startTime: Date.now()
        }

        const pScore = calculateHand(playerCards)
        const dScore = calculateHand(dealerCards)

        // Vitória instantânea por Blackjack Natural
        if (pScore === 21) {
            if (dScore === 21) {
                // Empate de Blackjack
                let doc = "╔══════════════════════════════╗\n"
                doc += "║    🤝 *BLACKJACK — EMPATE!* 🤝    ║\n"
                doc += "╚══════════════════════════════╝\n\n"
                doc += "🃏 *Suas Cartas:* " + formatCards(playerCards) + " (21 pts)\n"
                doc += "🤖 *Dealer:* " + formatCards(dealerCards) + " (21 pts)\n\n"
                doc += "💵 Ambos tiraram Blackjack natural! Sua aposta de " + betAmount.toLocaleString("pt-BR") + " Coins foi devolvida."
                return reply(doc.trim(), [sender])
            } else {
                const prize = Math.floor(betAmount * 1.5)
                user.coins = (user.coins || 0) + prize
                await dataService.saveXpData(xpData)

                let doc = `╔══════════════════════════════╗\n`
                doc += `║   🌟 *BLACKJACK NATURAL!* 🌟    ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `🎉 *Você tirou 21 pontos de primeira!*\n\n`
                doc += `🃏 *Suas Cartas:* ${formatCards(playerCards)} (21 pts)\n`
                doc += `🤖 *Dealer:* ${formatCards(dealerCards)} (${dScore} pts)\n\n`
                doc += `⭐ *Multiplicador:* 2.5x\n`
                doc += `💵 *Lucro:* +${prize.toLocaleString('pt-BR')} Coins\n`
                doc += `💰 *Novo Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins`
                return reply(doc.trim(), [sender])
            }
        }

        activeGames.set(gameKey, game)

        let doc = "╔══════════════════════════════╗\n"
        doc += "║      🃏 *BLACKJACK (21)* 🃏      ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += "🃏 *Suas Cartas:* " + formatCards(playerCards) + " (*" + pScore + " pts*)\n"
        doc += "🤖 *Dealer:* " + formatCards(dealerCards, true) + "\n"
        doc += "💰 *Aposta:* " + betAmount.toLocaleString("pt-BR") + " Coins\n\n"
        doc += "🎯 *O que você deseja fazer?*\n"
        doc += "👉 \`.hit\` — Pedir mais uma carta\n"
        doc += "👉 \`.stand\` — Parar com suas cartas atuais\n"
        doc += "👉 \`.double\` — Dobrar aposta e receber 1 carta final"
        return reply(doc.trim(), [sender])
    }
}

async function resolveDealer(game, user, xpData, reply, sender, botName) {
    activeGames.delete(sender)

    let dScore = calculateHand(game.dealerCards)
    while (dScore < 17) {
        game.dealerCards.push(game.deck.pop())
        dScore = calculateHand(game.dealerCards)
    }

    const pScore = calculateHand(game.playerCards)
    let won = false
    let tie = false
    let profit = 0

    if (pScore > 21) {
        won = false
    } else if (dScore > 21) {
        won = true
        profit = game.bet
    } else if (pScore > dScore) {
        won = true
        profit = game.bet
    } else if (pScore < dScore) {
        won = false
    } else {
        tie = true
    }

    if (won) {
        user.coins = (user.coins || 0) + profit
    } else if (!tie) {
        user.coins = Math.max(0, (user.coins || 0) - game.bet)
    }

    await dataService.saveXpData(xpData)
    logger.info("[BLACKJACK] " + sender + " finalizou jogo: " + (won ? "VENCEU +" + profit : (tie ? "EMPATE" : "PERDEU -" + game.bet)))

    let doc = "╔══════════════════════════════╗\n"
    if (won) doc += "║     🎉 *VOCÊ VENCEU O 21!* 🎉    ║\n"
    else if (tie) doc += "║    🤝 *BLACKJACK — EMPATE!* 🤝    ║\n"
    else doc += "║    💀 *DEALER VENCEU O 21!* 💀    ║\n"
    doc += "╚══════════════════════════════╝\n\n"

    doc += "🃏 *Suas Cartas:* " + formatCards(game.playerCards) + " (*" + pScore + " pts*)\n"
    doc += "🤖 *Cartas do Dealer:* " + formatCards(game.dealerCards) + " (*" + dScore + " pts*)\n\n"

    if (won) {
        doc += "⭐ *Resultado:* " + (dScore > 21 ? "Dealer Estourou!" : "Sua pontuação foi maior!") + "\n"
        doc += "💵 *Lucro Líquido:* +" + profit.toLocaleString("pt-BR") + " Coins\n"
        doc += "💰 *Novo Saldo:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins"
    } else if (tie) {
        doc += "🤝 *Resultado:* Empate de pontos! Sua aposta de " + game.bet.toLocaleString("pt-BR") + " Coins foi devolvida.\n"
        doc += "💰 *Saldo:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins"
    } else {
        doc += "💀 *Resultado:* " + (pScore > 21 ? "Você estourou!" : "O Dealer fez mais pontos.") + "\n"
        doc += "💸 *Prejuízo:* -" + game.bet.toLocaleString("pt-BR") + " Coins\n"
        doc += "💰 *Novo Saldo:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins"
    }

    doc += "\n\n👑 *" + botName + "*"
    return reply(doc.trim(), [sender])
}
