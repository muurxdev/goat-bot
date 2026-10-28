const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { formatCoins } = require("../../utils/uiEngine")
const logger = require("../../core/logger")

const activeGames = new Map()

module.exports = {
    name: "mines",
    aliases: ["minas","cmd_mines","alt_mines","atalho_mines","abrev_mines","call_mines","func_mines"],
    category: "economy",
    subcategory: "Jogos",
    description: "Campo minado com aposta! Encontre células seguras para multiplicar seus coins",
    cooldownMs: 30000,
    execute: async ({ sender, args, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const subcommand = (args[0] || "").toLowerCase()

        if (subcommand === "stop" || subcommand === "parar" || subcommand === "sacar") {
            const game = activeGames.get(sender)
            if (!game) {
                return reply("❌ Você não tem nenhum jogo de mines ativo!")
            }

            activeGames.delete(sender)
            const winnings = Math.floor(game.bet * game.multiplier)
            user.coins = (user.coins || 0) + winnings

            if (!user.transactionHistory) user.transactionHistory = []
            user.transactionHistory.push({
                type: "mines_cashout",
                amount: winnings,
                multiplier: game.multiplier.toFixed(2),
                safeFound: game.safeFound,
                timestamp: Date.now()
            })
            if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

            await dataService.saveXpData(xpData)
            logger.info(`[MINES] ${sender} stop em ${game.multiplier.toFixed(2)}x, ganhou ${winnings}`)

            let doc = "╔══════════════════════════════╗\n"
            doc += "║   ⛏️ *MINES - COLETADO* ⛏️   ║\n"
            doc += "╚══════════════════════════════╝\n\n"
            doc += renderBoard(game) + "\n\n"
            doc += `📈 *Multiplicador Final:* ${game.multiplier.toFixed(2)}x\n`
            doc += `💵 *Aposta:* ${formatCoins(game.bet)}\n`
            doc += `💰 *Ganho:* +${formatCoins(winnings)}\n`
            doc += `🪙 *Novo Saldo:* ${formatCoins(user.coins)}`

            return reply(doc.trim())
        }

        if (subcommand === "pick" || subcommand === "escolher") {
            const game = activeGames.get(sender)
            if (!game) {
                return reply("❌ Você não tem nenhum jogo de mines ativo!\n📌 Inicie com `.mines <valor>`")
            }

            const cellIndex = parseInt(args[1], 10)
            if (isNaN(cellIndex) || cellIndex < 1 || cellIndex > 25) {
                return reply("❌ Escolha uma célula de 1 a 25!\n📌 Uso: `.mines pick <número>`")
            }

            const idx = cellIndex - 1
            if (game.revealed.includes(idx)) {
                return reply("❌ Essa célula já foi revelada! Escolha outra.")
            }

            game.revealed.push(idx)

            if (game.mines.includes(idx)) {
                activeGames.delete(sender)
                user.coins = Math.max(0, (user.coins || 0) - game.bet)

                if (!user.transactionHistory) user.transactionHistory = []
                user.transactionHistory.push({
                    type: "mines_loss",
                    amount: -game.bet,
                    timestamp: Date.now()
                })
                if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

                await dataService.saveXpData(xpData)
                logger.info(`[MINES] ${sender} explodiu na célula ${cellIndex}, perdeu ${game.bet}`)

                let doc = "╔══════════════════════════════╗\n"
                doc += "║   💥 *MINES - EXPLODIU!* 💥   ║\n"
                doc += "╚══════════════════════════════╝\n\n"
                doc += renderBoard(game, true) + "\n\n"
                doc += `💣 *Você pisou em uma mina na célula ${cellIndex}!*\n`
                doc += `💸 *Perda:* -${formatCoins(game.bet)}\n`
                doc += `🪙 *Saldo Restante:* ${formatCoins(user.coins)}`

                return reply(doc.trim())
            }

            game.safeFound++
            game.multiplier = calculateMultiplier(game.safeFound, game.totalMines)

            let doc = "╔══════════════════════════════╗\n"
            doc += "║   ✅ *MINES - SEGURA!* ✅   ║\n"
            doc += "╚══════════════════════════════╝\n\n"
            doc += renderBoard(game) + "\n\n"
            doc += `📈 *Multiplicador Atual:* ${game.multiplier.toFixed(2)}x\n`
            doc += `💰 *Possível Ganho:* ${formatCoins(Math.floor(game.bet * game.multiplier))}\n\n`
            doc += `💡 Continuar ou *.mines stop* para coletar?`

            return reply(doc.trim())
        }

        if (subcommand === "status" || subcommand === "") {
            const game = activeGames.get(sender)
            if (game) {
                let doc = "╔══════════════════════════════╗\n"
                doc += "║   ⛏️ *MINES - EM ANDAMENTO* ⛏️   ║\n"
                doc += "╚══════════════════════════════╝\n\n"
                doc += renderBoard(game) + "\n\n"
                doc += `📈 *Multiplicador:* ${game.multiplier.toFixed(2)}x\n`
                doc += `💰 *Possível Ganho:* ${formatCoins(Math.floor(game.bet * game.multiplier))}\n\n`
                doc += `💡 \`.mines pick <1-25>\` ou \`.mines stop\``
                return reply(doc.trim())
            }

            if (!args[0]) {
                let help = "╔══════════════════════════════╗\n"
                help += "║     ⛏️ *MINES* ⛏️     ║\n"
                help += "╚══════════════════════════════╝\n\n"
                help += "📌 *Como Jogar:*\n"
                help += "• \`.mines <valor>\` — Iniciar jogo\n"
                help += "• \`.mines pick <1-25>\` — Escolher célula\n"
                help += "• \`.mines stop\` — Coletar ganhos\n\n"
                help += "📊 *Regras:*\n"
                help += "• Tabuleiro 5x5 com minas escondidas\n"
                help += "• Cada célula segura aumenta o multiplicador\n"
                help += "• Se acertar uma mina, perde tudo\n\n"
                help += `💰 *Seu Saldo:* ${formatCoins(user.coins || 0)}`
                return reply(help.trim())
            }
        }

        const betAmount = parseInt(subcommand, 10)
        if (isNaN(betAmount) || betAmount < 10) {
            return reply("❌ Valor mínimo de aposta: 10 Coins.\n📌 Uso: `.mines <valor>`")
        }

        if ((user.coins || 0) < betAmount) {
            return reply(`❌ Saldo insuficiente! Você possui ${formatCoins(user.coins || 0)}.`)
        }

        if (activeGames.get(sender)) {
            return reply("❌ Você já tem um jogo de mines ativo! Use `.mines stop` para coletar.")
        }

        user.coins = (user.coins || 0) - betAmount

        const totalMines = 5
        const mines = []
        while (mines.length < totalMines) {
            const m = Math.floor(Math.random() * 25)
            if (!mines.includes(m)) mines.push(m)
        }

        const game = {
            bet: betAmount,
            multiplier: 1.00,
            mines: mines,
            revealed: [],
            safeFound: 0,
            totalMines: totalMines,
            startTime: Date.now()
        }
        activeGames.set(sender, game)

        if (!user.transactionHistory) user.transactionHistory = []
        user.transactionHistory.push({
            type: "mines_bet",
            amount: -betAmount,
            timestamp: Date.now()
        })
        if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

        await dataService.saveXpData(xpData)

        let doc = "╔══════════════════════════════╗\n"
        doc += "║     ⛏️ *MINES* ⛏️     ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += renderBoard(game) + "\n\n"
        doc += `💵 *Aposta:* ${formatCoins(betAmount)}\n`
        doc += `💣 *Minas:* ${totalMines}\n\n`
        doc += `💡 \`.mines pick <1-25>\` para escolher uma célula\n`
        doc += `💡 \`.mines stop\` para coletar seus ganhos\n\n`
        doc += `🪙 *Saldo Restante:* ${formatCoins(user.coins)}`

        return reply(doc.trim())

        function calculateMultiplier(safeFound, totalMines) {
            const totalCells = 25
            let mult = 1.00
            for (let i = 0; i < safeFound; i++) {
                mult *= (totalCells - i) / (totalCells - i - totalMines)
            }
            return Math.floor(mult * 100) / 100
        }

        function renderBoard(game, revealAll = false) {
            let board = ""
            for (let row = 0; row < 5; row++) {
                let line = ""
                for (let col = 0; col < 5; col++) {
                    const idx = row * 5 + col
                    const num = idx + 1
                    if (game.revealed.includes(idx)) {
                        if (game.mines.includes(idx)) {
                            line += " 💣"
                        } else {
                            line += " ✅"
                        }
                    } else if (revealAll && game.mines.includes(idx)) {
                        line += " 💣"
                    } else {
                        line += ` ${num.toString().padStart(2, " ")}`
                    }
                    line += " │"
                }
                board += line.slice(0, -1) + "\n"
                if (row < 4) board += "────┼────┼────┼────┼────\n"
            }
            return "```\n" + board + "```"
        }
    }
}
