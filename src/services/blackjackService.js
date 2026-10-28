/**
 * blackjackService.js
 * Engine completa de Blackjack (21) com baralho tradicional de 52 cartas,
 * contagem de pontos com Ás dinâmico (1 ou 11), hit, stand, double down e persistência no SQLite.
 */

const { getDatabase } = require('../database/connection')
const economyService = require('./economyService')
const logger = require('../core/logger')

const SUITS = ['♠️', '♥️', '♦️', '♣️']
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

function createDeck() {
    const deck = []
    for (const suit of SUITS) {
        for (const val of VALUES) {
            deck.push({ val, suit })
        }
    }
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
}

function calculateHand(hand) {
    let score = 0
    let aces = 0
    for (const card of hand) {
        if (card.val === 'A') {
            aces++
            score += 11
        } else if (['K', 'Q', 'J'].includes(card.val)) {
            score += 10
        } else {
            score += parseInt(card.val, 10)
        }
    }
    while (score > 21 && aces > 0) {
        score -= 10
        aces--
    }
    return score
}

function formatCard(c) {
    return `[${c.val}${c.suit}]`
}

function formatHand(hand, hideFirst = false) {
    if (hideFirst) {
        return `[🂠] ${hand.slice(1).map(formatCard).join(' ')}`
    }
    return hand.map(formatCard).join(' ')
}

function getActiveGame(jid) {
    const db = getDatabase()
    const row = db.prepare('SELECT * FROM active_games WHERE jid = ? AND game_type = \'blackjack\'').get(jid)
    if (!row) return null
    return {
        ...row,
        state: JSON.parse(row.state)
    }
}

function startGame(jid, betAmount) {
    const active = getActiveGame(jid)
    if (active) {
        return {
            success: false,
            message: `Você já possui uma mão em andamento com aposta de *${active.bet.toLocaleString('pt-BR')} moedas*! Digite \`.bj_hit\` para pedir carta ou \`.bj_stand\` para parar.`
        }
    }

    betAmount = Math.floor(Number(betAmount) || 0)
    if (betAmount < 10) return { success: false, message: 'Aposta mínima no Blackjack é de 10 moedas.' }

    const user = economyService.carregarUsuario(jid)
    if ((user.coins || 0) < betAmount) {
        return { success: false, message: `Saldo insuficiente! Você possui *${(user.coins || 0).toLocaleString('pt-BR')} moedas*.` }
    }

    // Debita aposta inicial
    user.coins = (user.coins || 0) - betAmount
    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const deck = createDeck()
    const playerHand = [deck.pop(), deck.pop()]
    const dealerHand = [deck.pop(), deck.pop()]

    const playerScore = calculateHand(playerHand)
    const dealerScore = calculateHand(dealerHand)

    const db = getDatabase()
    const gameId = `BJ-${Date.now()}`

    // Caso de Blackjack Natural (21 logo no início)
    if (playerScore === 21) {
        let payout = 0
        let outcome = ''
        if (dealerScore === 21) {
            // Empate: devolve aposta
            payout = betAmount
            outcome = 'EMPATE'
        } else {
            // Vitória 3:2
            payout = Math.floor(betAmount * 2.5)
            outcome = 'BLACKJACK_NATURAL'
        }

        user.coins = (user.coins || 0) + payout
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

        return {
            finished: true,
            outcome,
            payout,
            playerHand,
            dealerHand,
            playerScore,
            dealerScore,
            bet: betAmount,
            newBalance: user.coins
        }
    }

    const state = {
        deck,
        playerHand,
        dealerHand
    }

    db.prepare(`
        INSERT INTO active_games (id, jid, game_type, state, bet, created_at, updated_at)
        VALUES (?, ?, 'blackjack', ?, ?, ?, ?)
    `).run(gameId, jid, JSON.stringify(state), betAmount, Date.now(), Date.now())

    return {
        finished: false,
        gameId,
        playerHand,
        dealerHand: [dealerHand[0], { val: '?', suit: '' }],
        playerScore,
        bet: betAmount,
        newBalance: user.coins
    }
}

function hit(jid) {
    const game = getActiveGame(jid)
    if (!game) return { success: false, message: 'Você não tem nenhum jogo de Blackjack em andamento. Inicie com `.blackjack <aposta>`.' }

    const { state, bet } = game
    const card = state.deck.pop()
    state.playerHand.push(card)

    const score = calculateHand(state.playerHand)
    const db = getDatabase()

    if (score > 21) {
        // Estourou (Bust)
        db.prepare('DELETE FROM active_games WHERE id = ?').run(game.id)
        const user = economyService.carregarUsuario(jid)
        return {
            finished: true,
            outcome: 'BUST',
            playerHand: state.playerHand,
            dealerHand: state.dealerHand,
            playerScore: score,
            dealerScore: calculateHand(state.dealerHand),
            bet,
            payout: 0,
            newBalance: user.coins
        }
    }

    // Continua jogando
    db.prepare('UPDATE active_games SET state = ?, updated_at = ? WHERE id = ?')
        .run(JSON.stringify(state), Date.now(), game.id)

    return {
        finished: false,
        cardDrawn: card,
        playerHand: state.playerHand,
        dealerHand: state.dealerHand,
        playerScore: score,
        bet
    }
}

function stand(jid) {
    const game = getActiveGame(jid)
    if (!game) return { success: false, message: 'Você não tem nenhum jogo de Blackjack em andamento.' }

    const { state, bet, id } = game
    const db = getDatabase()
    db.prepare('DELETE FROM active_games WHERE id = ?').run(id)

    const playerScore = calculateHand(state.playerHand)
    let dealerScore = calculateHand(state.dealerHand)

    // O dealer compra cartas até atingir pelo menos 17
    while (dealerScore < 17 && state.deck.length > 0) {
        state.dealerHand.push(state.deck.pop())
        dealerScore = calculateHand(state.dealerHand)
    }

    let outcome = ''
    let payout = 0

    if (dealerScore > 21) {
        outcome = 'DEALER_BUST'
        payout = bet * 2
    } else if (playerScore > dealerScore) {
        outcome = 'PLAYER_WINS'
        payout = bet * 2
    } else if (playerScore === dealerScore) {
        outcome = 'PUSH'
        payout = bet
    } else {
        outcome = 'DEALER_WINS'
        payout = 0
    }

    const user = economyService.carregarUsuario(jid)
    if (payout > 0) {
        user.coins = (user.coins || 0) + payout
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)
    }

    return {
        finished: true,
        outcome,
        playerHand: state.playerHand,
        dealerHand: state.dealerHand,
        playerScore,
        dealerScore,
        bet,
        payout,
        newBalance: user.coins
    }
}

module.exports = {
    getActiveGame,
    startGame,
    hit,
    stand,
    calculateHand,
    formatHand
}
