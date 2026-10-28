const logger = require('../../core/logger')

const activeGames = new Map()

function generateSolved() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0))
    function isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num) return false
            if (board[i][col] === num) return false
        }
        const br = Math.floor(row / 3) * 3
        const bc = Math.floor(col / 3) * 3
        for (let r = br; r < br + 3; r++) {
            for (let c = bc; c < bc + 3; c++) {
                if (board[r][c] === num) return false
            }
        }
        return true
    }
    function solve(board) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] === 0) {
                    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
                    for (const n of nums) {
                        if (isValid(board, r, c, n)) {
                            board[r][c] = n
                            if (solve(board)) return true
                            board[r][c] = 0
                        }
                    }
                    return false
                }
            }
        }
        return true
    }
    solve(board)
    return board
}

function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function createPuzzle(solved, cellsToKeep = 40) {
    const puzzle = solved.map(r => [...r])
    const positions = []
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            positions.push([r, c])
        }
    }
    const shuffled = shuffle(positions)
    let removed = 81 - cellsToKeep
    for (const [r, c] of shuffled) {
        if (removed <= 0) break
        puzzle[r][c] = 0
        removed--
    }
    return puzzle
}

function formatGrid(grid, editable) {
    let lines = ['  1 2 3  4 5 6  7 8 9']
    for (let r = 0; r < 9; r++) {
        let row = `${r + 1} `
        for (let c = 0; c < 9; c++) {
            const val = grid[r][c]
            if (val === 0) row += '❌ '
            else if (editable && editable[`${r},${c}`]) row += `${val}  `
            else row += `${val}  `
            if (c === 2 || c === 5) row += ' '
        }
        lines.push(row)
        if (r === 2 || r === 5) lines.push('  ─────────────────')
    }
    return lines.join('\n')
}

function isComplete(grid) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c] === 0) return false
        }
    }
    return true
}

module.exports = {
    name: 'sudoku',
    aliases: ['sudokugrid'],
    category: 'fun',
    subcategory: 'Jogos',
    description: 'Sudoku 9x9 — resolva o puzzle numérico',
    cooldownMs: 5000,
    execute: async ({ from, sender, reply, args }) => {
        const key = `${from}_${sender}`
        const game = activeGames.get(key)
        const input = (args[0] || '').trim()

        if (!game) {
            const solved = generateSolved()
            const puzzle = createPuzzle(solved, 40)
            const editable = {}
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (puzzle[r][c] === 0) editable[`${r},${c}`] = true
                }
            }
            const newGame = {
                solved,
                grid: puzzle.map(r => [...r]),
                editable,
                createdAt: Date.now()
            }
            activeGames.set(key, newGame)
            return reply(
                `🔢 *SUDOKU 9x9*\n\n` +
                `\`\`\`\n${formatGrid(newGame.grid)}\n\`\`\`\n\n` +
                `📝 *Como jogar:*\n` +
                `• \`.sudoku <linha><coluna><numero>\`\n` +
                `• Exemplo: \`.sudoku 135\` = linha 1, coluna 3, número 5\n\n` +
                `❌ = célula vazia | Os números são os fixos\n` +
                `Preencha todas as células para vencer!`
            )
        }

        if (!input || !/^[1-9]{3}$/.test(input)) {
            return reply('❌ Formato inválido! Use `.sudoku <linha><coluna><numero>` (ex: `.sudoku 135`)')
        }

        const row = parseInt(input[0]) - 1
        const col = parseInt(input[1]) - 1
        const num = parseInt(input[2])

        if (row < 0 || row >= 9 || col < 0 || col >= 9) {
            return reply('❌ Posição inválida! Use números de 1 a 9.')
        }

        if (!game.editable[`${row},${col}`]) {
            return reply('❌ Essa célula já está preenchida com um número fixo!')
        }

        game.grid[row][col] = num

        if (isComplete(game.grid)) {
            let valid = true
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (game.grid[r][c] !== game.solved[r][c]) {
                        valid = false
                        break
                    }
                }
                if (!valid) break
            }
            if (valid) {
                activeGames.delete(key)
                return reply(
                    `🎉 *SUDOKU COMPLETO E CORRETO!*\n\n` +
                    `\`\`\`\n${formatGrid(game.grid)}\n\`\`\`\n\n` +
                    `🏆 Parabéns! Você resolveu o Sudoku!`
                )
            }
            return reply(
                `⚠️ *GRID COMPLETO MAS COM ERROS!*\n\n` +
                `\`\`\`\n${formatGrid(game.grid)}\n\`\`\`\n\n` +
                `❌ Algumas posições estão incorretas. Inicie um novo jogo com \`.sudoku\`!`
            )
        }

        return reply(
            `🔢 *SUDOKU — CELULA ${row + 1},${col + 1} = ${num}*\n\n` +
            `\`\`\`\n${formatGrid(game.grid)}\n\`\`\`\n\n` +
            `👉 Use \`.sudoku <lin><col><num>\` para a próxima jogada!`
        )
    }
}
