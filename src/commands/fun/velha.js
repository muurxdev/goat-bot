/**
 * Jogo da Velha Interativo (Tic-Tac-Toe)
 * Suporte a 1v1 entre membros ou contra o Bot com persistência de XP e moedas
 */
const F = require('../../utils/formato')

const dataService = require('../../services/dataService')
const { initializeUser, adicionarXp } = require('../../services/xpService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

// Map<from, { playerX, playerO, board, turn, isBot, lastMove }>
const games = new Map()

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
]

function renderBoard(board) {
    const numEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
    const getIcon = (val, idx) => {
        if (val === 'X') return '❌'
        if (val === 'O') return '⭕'
        return numEmojis[idx]
    }

    let b = ''
    b += ` ${getIcon(board[0], 0)} │ ${getIcon(board[1], 1)} │ ${getIcon(board[2], 2)}\n`
    b += `────┼────┼────\n`
    b += ` ${getIcon(board[3], 3)} │ ${getIcon(board[4], 4)} │ ${getIcon(board[5], 5)}\n`
    b += `────┼────┼────\n`
    b += ` ${getIcon(board[6], 6)} │ ${getIcon(board[7], 7)} │ ${getIcon(board[8], 8)}`
    return b
}

function checkWinner(board) {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]
        }
    }
    if (board.every(cell => cell !== null)) {
        return 'DRAW'
    }
    return null
}

function botBestMove(board) {
    // 1. Tenta vencer
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'O'
            if (checkWinner(board) === 'O') {
                board[i] = null
                return i
            }
            board[i] = null
        }
    }
    // 2. Bloqueia vitória do jogador
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'X'
            if (checkWinner(board) === 'X') {
                board[i] = null
                return i
            }
            board[i] = null
        }
    }
    // 3. Pega o centro se livre
    if (board[4] === null) return 4
    // 4. Pega cantos
    const corners = [0, 2, 6, 8].filter(c => board[c] === null)
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)]
    }
    // 5. Qualquer disponível
    const avail = board.map((v, i) => v === null ? i : null).filter(v => v !== null)
    return avail[Math.floor(Math.random() * avail.length)]
}

module.exports = {
    name: 'velha',
    aliases: [ 'tictactoe', 'ttt'],
    category: 'fun',
    description: 'Jogo da velha contra outro membro ou contra mim',
    usage: '[@pessoa | bot | 1-9 | sair]',
    examples: ['@pessoa — desafia alguém do grupo', 'bot — joga contra mim', '5 — marca a casa do meio', 'sair — encerra a partida'],
    subcategory: 'Jogos',
    cooldownMs: 1000,
    execute: async ({ from, sender, args, info, isGroup, reply, client, prefix = '.' }) => {
        const sub = (args[0] || '').toLowerCase()
        const game = games.get(from)

        // Cancelar jogo
        if (sub === 'sair' || sub === 'cancelar' || sub === 'reset') {
            if (!game) return reply('🎮 Não tem partida de jogo da velha aberta neste grupo.\n\n👉 Comece uma com ' + F.cmd(prefix, 'velha', '@pessoa') + ' ou ' + F.cmd(prefix, 'velha', 'bot') + ' para jogar comigo.')
            if (game.playerX !== sender && game.playerO !== sender && !game.isBot) {
                return reply('🎮 Só quem está jogando pode encerrar a partida. Espere ela terminar para começar outra.')
            }
            games.delete(from)
            return reply('🛑 *Partida encerrada.*\n\n👉 Nova partida: ' + F.cmd(prefix, 'velha', '@pessoa') + ' ou ' + F.cmd(prefix, 'velha', 'bot'))
        }

        // Se for um movimento numérico (1 a 9)
        const movePos = parseInt(sub)
        if (!isNaN(movePos) && movePos >= 1 && movePos <= 9) {
            if (!game) {
                return reply(F.tela({ emoji: '🎮', titulo: 'Nenhuma partida aberta', intro: 'Antes de marcar uma casa, alguém precisa começar a partida.', secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: ['• ' + F.cmd(prefix, 'velha', '@pessoa') + ' — contra alguém do grupo', '• ' + F.cmd(prefix, 'velha', 'bot') + ' — contra mim'] }], prefix }))
            }

            const isPlayerTurn = (game.turn === 'X' && game.playerX === sender) || (game.turn === 'O' && game.playerO === sender)
            if (!isPlayerTurn) {
                return reply('⏳ Ainda não é a sua vez. Espere a outra pessoa jogar.')
            }

            const cellIdx = movePos - 1
            if (game.board[cellIdx] !== null) {
                return reply('⚠️ Essa casa já está marcada. Escolha um número livre de 1 a 9.\n\n' + renderBoard(game.board))
            }

            // Executa a jogada
            game.board[cellIdx] = game.turn
            let winner = checkWinner(game.board)

            if (!winner && game.isBot && game.turn === 'X') {
                // Jogada da IA
                const botMove = botBestMove(game.board)
                if (botMove !== undefined && botMove !== null) {
                    game.board[botMove] = 'O'
                    winner = checkWinner(game.board)
                }
            } else if (!winner) {
                game.turn = game.turn === 'X' ? 'O' : 'X'
            }

            // Fim de jogo?
            if (winner) {
                games.delete(from)
                let endMsg = `🎮 *Jogo da velha*\n\n`
                endMsg += renderBoard(game.board) + '\n\n'

                if (winner === 'DRAW') {
                    endMsg += `⚖️ *Empate!* Ninguém fechou uma linha.\n⭐ +25 XP para ${game.isBot ? 'você' : 'cada jogador'}.\n\n👉 Revanche: ${F.cmd(prefix, 'velha', game.isBot ? 'bot' : '@pessoa')}`
                    const p1 = initializeUser(game.playerX)
                    adicionarXp(p1, 25, { source: 'rpg' })
                    dataService.saveUser(p1)
                    if (!game.isBot) {
                        const p2 = initializeUser(game.playerO)
                        adicionarXp(p2, 25, { source: 'rpg' })
                        dataService.saveUser(p2)
                    }
                    return reply(endMsg)
                }

                const winnerJid = winner === 'X' ? game.playerX : game.playerO
                const botVenceu = winner === 'O' && game.isBot
                const winnerName = botVenceu ? '*' + getBotName() + '*' : `@${winnerJid.split('@')[0]}`

                if (botVenceu) {
                    endMsg += `🏆 *Eu venci desta vez!* Fechei a linha antes de você.\n\n👉 Revanche: ${F.cmd(prefix, 'velha', 'bot')}`
                } else {
                    endMsg += `🏆 *Vitória de ${winnerName}!*\n💰 +200 moedas e ⭐ +150 XP para quem venceu.\n\n👉 Nova partida: ${F.cmd(prefix, 'velha', '@pessoa')}`
                }

                if (winnerJid && !(winner === 'O' && game.isBot)) {
                    const uWin = initializeUser(winnerJid)
                    const { lvlRes } = adicionarXp(uWin, 150, { source: 'rpg' })
                    uWin.coins = (uWin.coins || 0) + 200
                    uWin.wins = (uWin.wins || 0) + 1
                    dataService.saveUser(uWin)
                    if (lvlRes.subiu) endMsg += `\n🆙 *Subiu de nível!* ${winnerName} agora está no nível ${uWin.level}.`
                }

                return reply(endMsg, [game.playerX, game.playerO].filter(j => j && j.includes('@')))
            }

            // Jogo continua: Mostra tabuleiro
            const nextTurnJid = game.turn === 'X' ? game.playerX : game.playerO
            const nextTurnName = (game.turn === 'O' && game.isBot) ? '*' + getBotName() + '*' : `@${nextTurnJid.split('@')[0]}`

            let statusMsg = `🎮 *Jogo da velha*\n\n`
            statusMsg += renderBoard(game.board) + '\n\n'
            statusMsg += `👉 *Vez de:* ${nextTurnName} (${game.turn === 'X' ? '❌' : '⭕'})\n`
            statusMsg += `💡 _Digite ${F.cmd(prefix, 'velha', '<1-9>')} com o número da casa livre._\n🛑 _Para encerrar:_ ${F.cmd(prefix, 'velha', 'sair')}`

            return reply(statusMsg, [game.playerX, game.playerO].filter(j => j && j.includes('@')))
        }

        // Início de Nova Partida
        if (game) {
            return reply('🎮 *Já tem uma partida valendo neste grupo.*\n\n' + renderBoard(game.board) + '\n\n• ' + F.cmd(prefix, 'velha', '<1-9>') + ' — marcar uma casa\n• ' + F.cmd(prefix, 'velha', 'sair') + ' — encerrar a partida')
        }

        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const isVsBot = sub === 'bot' || sub === 'ia' || !mentioned

        const playerX = sender
        const playerO = isVsBot ? 'BOT@s.whatsapp.net' : mentioned

        if (!isVsBot && playerO === playerX) {
            return reply('🎮 Não dá para jogar contra você mesmo.\n\n• ' + F.cmd(prefix, 'velha', '@pessoa') + ' — marque outra pessoa\n• ' + F.cmd(prefix, 'velha', 'bot') + ' — jogue contra mim')
        }

        const newGame = {
            playerX,
            playerO,
            board: Array(9).fill(null),
            turn: 'X',
            isBot: isVsBot,
            createdAt: Date.now()
        }
        games.set(from, newGame)

        const opponentLabel = isVsBot ? '*' + getBotName() + '* (eu)' : `@${playerO.split('@')[0]}`

        let startMsg = `🎮 *Jogo da velha começou*\n\n`
        startMsg += `⚔️ @${playerX.split('@')[0]} (❌) *VS* ${opponentLabel} (⭕)\n\n`
        startMsg += renderBoard(newGame.board) + '\n\n'
        startMsg += `👉 *Primeira jogada:* @${playerX.split('@')[0]} (❌)\n`
        startMsg += `💡 _Digite ${F.cmd(prefix, 'velha', '1')} a ${F.cmd(prefix, 'velha', '9')} para marcar a casa. Quem vencer ganha 200 moedas e 150 XP._`

        return reply(startMsg, [playerX, playerO].filter(j => j && j.includes('@')))
    }
}
