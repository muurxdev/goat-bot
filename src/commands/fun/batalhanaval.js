const logger = require('../../core/logger')

const COLS = 'ABCDEFGHIJ'
const SHIPS = [
    { size: 5, name: 'Porta-aviões' },
    { size: 4, name: 'Encouraçado' },
    { size: 3, name: 'Cruzador' },
    { size: 3, name: 'Submarino' },
    { size: 2, name: 'Torpedeira' }
]

const activeGames = new Map()
const TTL_MS = 10 * 60 * 1000

function cleanupExpired() {
    const now = Date.now()
    for (const [key, game] of activeGames) {
        if (now - game.createdAt > TTL_MS) activeGames.delete(key)
    }
}

function createEmptyBoard() {
    return Array.from({ length: 10 }, () => Array(10).fill(0))
}

function canPlace(board, row, col, size, horizontal) {
    for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i
        const c = horizontal ? col + i : col
        if (r < 0 || r >= 10 || c < 0 || c >= 10) return false
        if (board[r][c] !== 0) return false
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr
                const nc = c + dc
                if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && board[nr][nc] !== 0) {
                    if (!(dr === 0 && dc === 0)) return false
                }
            }
        }
    }
    return true
}

function placeShip(board, row, col, size, horizontal, id) {
    for (let i = 0; i < size; i++) {
        const r = horizontal ? row : row + i
        const c = horizontal ? col + i : col
        board[r][c] = id
    }
}

function placeShipsRandomly(board) {
    let id = 1
    for (const ship of SHIPS) {
        let placed = false
        let attempts = 0
        while (!placed && attempts < 200) {
            const horizontal = Math.random() > 0.5
            const row = Math.floor(Math.random() * 10)
            const col = Math.floor(Math.random() * 10)
            if (canPlace(board, row, col, ship.size, horizontal)) {
                placeShip(board, row, col, ship.size, horizontal, id)
                placed = true
            }
            attempts++
        }
        if (!placed) return false
        id++
    }
    return true
}

function formatBoardPlayer(board, shots) {
    let header = '    ' + COLS.split('').map(c => c + '  ').join('')
    let lines = [header]
    for (let r = 0; r < 10; r++) {
        let row = `${(r + 1).toString().padStart(2)} `
        for (let c = 0; c < 10; c++) {
            const shot = shots[`${r},${c}`]
            if (shot === 'hit') row += '🔥 '
            else if (shot === 'miss') row += '🌊 '
            else row += '⚓ '
        }
        lines.push(row)
    }
    return lines.join('\n')
}

function formatBoardEnemy(hits) {
    let header = '    ' + COLS.split('').map(c => c + '  ').join('')
    let lines = [header]
    for (let r = 0; r < 10; r++) {
        let row = `${(r + 1).toString().padStart(2)} `
        for (let c = 0; c < 10; c++) {
            const shot = hits[`${r},${c}`]
            if (shot === 'hit') row += '🔥 '
            else if (shot === 'miss') row += '🌊 '
            else row += '⬜ '
        }
        lines.push(row)
    }
    return lines.join('\n')
}

function countShipHits(board, shots, shipId) {
    let total = 0
    let hitCount = 0
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (board[r][c] === shipId) {
                total++
                if (shots[`${r},${c}`] === 'hit') hitCount++
            }
        }
    }
    return { total, hitCount }
}

function findSunkShip(board, shots) {
    for (let id = 1; id <= SHIPS.length; id++) {
        const { total, hitCount } = countShipHits(board, shots, id)
        if (total > 0 && hitCount === total) {
            const ship = SHIPS[id - 1]
            let positions = []
            for (let r = 0; r < 10; r++) {
                for (let c = 0; c < 10; c++) {
                    if (board[r][c] === id) positions.push(`${COLS[c]}${r + 1}`)
                }
            }
            return { name: ship.name, positions }
        }
    }
    return null
}

function allShipsSunk(board, shots) {
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (board[r][c] !== 0 && shots[`${r},${c}`] !== 'hit') return false
        }
    }
    return true
}

function botShoot(userBoard, userShots) {
    const available = []
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            if (!userShots[`${r},${c}`]) available.push(`${r},${c}`)
        }
    }
    if (available.length === 0) return null
    const pick = available[Math.floor(Math.random() * available.length)]
    const [r, c] = pick.split(',').map(Number)
    return { row: r, col: c }
}

module.exports = {
    name: 'batalhanaval',
    aliases: ['navios', 'naval', 'afundar-frota'],
    category: 'fun',
    subcategory: 'Jogos',
    description: 'Batalha naval 10x10 contra o bot',
    cooldownMs: 3000,
    execute: async ({ from, sender, reply, args, user }) => {
        cleanupExpired()
        const key = `${from}_${sender}`
        const game = activeGames.get(key)
        const shot = (args[0] || '').toUpperCase().trim()

        if (!game) {
            const playerBoard = createEmptyBoard()
            if (!placeShipsRandomly(playerBoard)) {
                return reply('❌ Erro ao gerar tabuleiro. Tente novamente.')
            }
            const botBoard = createEmptyBoard()
            if (!placeShipsRandomly(botBoard)) {
                return reply('❌ Erro ao gerar tabuleiro. Tente novamente.')
            }
            const newGame = {
                playerBoard,
                botBoard,
                playerShots: {},
                botShots: {},
                playerHits: {},
                createdAt: Date.now()
            }
            activeGames.set(key, newGame)
            const enemyView = formatBoardEnemy(newGame.playerHits)
            const playerView = formatBoardPlayer(newGame.botBoard, newGame.botShots)
            return reply(
                `⚓ *BATALHA NAVAL 10x10*\n\n` +
                `🗺️ *Seu tabuleiro (navios):*\n\`\`\`\n${playerView}\n\`\`\`\n\n` +
                `🎯 *Radar inimigo:*\n\`\`\`\n${enemyView}\n\`\`\`\n\n` +
                `📝 *Comandos:*\n` +
                `• \`.batalhanaval <coluna><linha>\` — atirar (ex: \`.batalhanaval A5\`)\n\n` +
                `🌊 = Água | 🔥 = Acerto | ⚓ = Navio\n` +
                `Afunde todos os 5 navios inimigos para vencer!`
            )
        }

        if (!shot || !/^[A-J][0-9]{1,2}$/.test(shot)) {
            return reply('❌ Formato inválido! Use `.batalhanaval <coluna><linha>` (ex: `.batalhanaval A5`)')
        }

        const col = COLS.indexOf(shot[0])
        const row = parseInt(shot.slice(1)) - 1
        if (row < 0 || row >= 10) {
            return reply('❌ Linha inválida! Use números de 1 a 10.')
        }

        const shotKey = `${row},${col}`
        if (game.playerShots[shotKey]) {
            return reply('❌ Você já atirou nessa posição! Tente outra.')
        }

        if (game.botBoard[row][col] !== 0) {
            game.playerShots[shotKey] = 'hit'
            game.playerHits[shotKey] = 'hit'
            const sunk = findSunkShip(game.botBoard, game.playerShots)
            if (sunk) {
                for (const pos of sunk.positions) {
                    const c = COLS.indexOf(pos[0])
                    const r = parseInt(pos.slice(1)) - 1
                    game.playerHits[`${r},${c}`] = 'hit'
                }
            }
            if (allShipsSunk(game.botBoard, game.playerShots)) {
                activeGames.delete(key)
                user.coins = (user.coins || 0) + 800
                const dataService = require('../../services/dataService')
                dataService.saveUser(user, { force: true })
                const enemyView = formatBoardEnemy(game.playerHits)
                return reply(
                    `🎉 *VITÓRIA TOTAL! TODOS OS NAVIOS INIMIGOS FORAM AFUNDADOS!*\n\n` +
                    `🗺️ *Radar final:*\n\`\`\`\n${enemyView}\n\`\`\`\n\n` +
                    `🏆 *Recompensa:* +800 Coins!`
                )
            }
            const sunkMsg = sunk ? `\n💥 *${sunk.name} AFUNDADO!*` : ''
            const enemyView = formatBoardEnemy(game.playerHits)
            return reply(
                `🔥 *ACERTOU!*\n\n` +
                `🎯 Posição \`${shot}\` — navio inimigo atingido!${sunkMsg}\n\n` +
                `🗺️ *Radar:*\n\`\`\`\n${enemyView}\n\`\`\``
            )
        } else {
            game.playerShots[shotKey] = 'miss'
            game.playerHits[shotKey] = 'miss'
        }

        const botShot = botShoot(game.playerBoard, game.botShots)
        let botMsg = ''
        if (botShot) {
            const botKey = `${botShot.row},${botShot.col}`
            const coord = `${COLS[botShot.col]}${botShot.row + 1}`
            if (game.playerBoard[botShot.row][botShot.col] !== 0) {
                game.botShots[botKey] = 'hit'
                botMsg = `🤖 O bot acertou seu navio na posição \`${coord}\`!`
            } else {
                game.botShots[botKey] = 'miss'
                botMsg = `🤖 O bot atirou em \`${coord}\` e errou!`
            }
        }

        const enemyView = formatBoardEnemy(game.playerHits)
        const playerView = formatBoardPlayer(game.playerBoard, game.botShots)

        return reply(
            `🌊 *ÁGUA!* Seu tiro em \`${shot}\` não acertou nada.\n\n` +
            `${botMsg}\n\n` +
            `🗺️ *Radar inimigo:*\n\`\`\`\n${enemyView}\n\`\`\`\n\n` +
            `⚓ *Seu tabuleiro:*\n\`\`\`\n${playerView}\n\`\`\`\n\n` +
            `👉 Use \`.batalhanaval <col><lin>\` para atirar novamente!`
        )
    }
}
