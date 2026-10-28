const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { formatCoins } = require("../../utils/uiEngine")
const { esperar } = require("../../utils/helpers")
const logger = require("../../core/logger")

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎"]

module.exports = {
    name: "slots",
    aliases: ["slotmachine","slot","cacaniquel","girar","cmd_slots","alt_slots","atalho_slots","abrev_slots","call_slots","func_slots"],
    category: "economy",
    subcategory: "Jogos",
    description: "Caça-níquel 3 rolos! 3 iguais = 10x, 2 iguais = 2x",
    cooldownMs: 5000,
    execute: async ({ sender, args, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!args[0]) {
            let help = "╔══════════════════════════════╗\n"
            help += "║   🎰 *CAÇA-NÍQUEL* 🎰   ║\n"
            help += "╚══════════════════════════════╝\n\n"
            help += "📌 *Como Jogar:*\n"
            help += "• \`.slots <valor>\` — Girar os rolos\n\n"
            help += "📊 *Pagamentos:*\n"
            help += "• 🍒🍒🍒 / 🍋🍋🍋 / 🍊🍊🍊 / 🍇🍇🍇 / ⭐⭐⭐ / 💎💎💎 = *10x*\n"
            help += "• 2 símbolos iguais = *2x*\n"
            help += "• Nenhum igual = perde\n\n"
            help += `💰 *Seu Saldo:* ${formatCoins(user.coins || 0)}`
            return reply(help.trim())
        }

        const betAmount = parseInt(args[0], 10)
        if (isNaN(betAmount) || betAmount < 10) {
            return reply("❌ Valor mínimo de aposta: 10 Coins.\n📌 Uso: `.slots <valor>`")
        }

        if ((user.coins || 0) < betAmount) {
            return reply(`❌ Saldo insuficiente! Você possui ${formatCoins(user.coins || 0)}.`)
        }

        user.coins = (user.coins || 0) - betAmount

        await reply("🎰 *CAÇA-NÍQUEL GIRANDO...*\n\n⏳ Preparando os rolos...")

        await esperar(1200)
        const s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        await reply(`🎰 *GIRANDO...*\n\n🔵 [ ${s1} | ❓ | ❓ ]`)

        await esperar(1200)
        const s2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        await reply(`🎰 *GIRANDO...*\n\n🔵 [ ${s1} | ${s2} | ❓ ]`)

        await esperar(1200)
        const s3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]

        let multiplier = 0
        let outcomeMsg = ""

        if (s1 === s2 && s2 === s3) {
            if (s1 === "💎") {
                multiplier = 15
                outcomeMsg = "💎🔥 *JACKPOT DE DIAMANTES!* 🔥💎 (15x)"
            } else if (s1 === "⭐") {
                multiplier = 12
                outcomeMsg = "⭐🌟 *ESTRELA DA SORTE!* 🌟⭐ (12x)"
            } else {
                multiplier = 10
                outcomeMsg = "🎉🎊 *TRIPLO COMBINADO!* 🎊🎉 (10x)"
            }
        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
            multiplier = 2
            outcomeMsg = "✨ *DUPLA DA SORTE!* ✨ (2x)"
        } else {
            outcomeMsg = "💸 *SEM COMBINAÇÃO...* 💸"
        }

        const winAmount = betAmount * multiplier
        if (winAmount > 0) {
            user.coins = (user.coins || 0) + winAmount
        }

        if (!user.transactionHistory) user.transactionHistory = []
        user.transactionHistory.push({
            type: "slots",
            amount: winAmount > 0 ? winAmount : -betAmount,
            symbols: [s1, s2, s3],
            multiplier: multiplier,
            timestamp: Date.now()
        })
        if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

        await dataService.saveXpData(xpData)
        logger.info(`[SLOTS] ${sender} apostou ${betAmount}, symbols: ${s1}${s2}${s3}, mult: ${multiplier}x`)

        let doc = "╔══════════════════════════════╗\n"
        doc += "║     🎰 *CAÇA-NÍQUEL* 🎰     ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += `╭━〔 🎰 RESULTADO 〕━━━⬣\n`
        doc += `┃     [ ${s1} | ${s2} | ${s3} ]\n`
        doc += `╰━━━━━━━━━━━━━━━━━⬣\n\n`
        doc += `${outcomeMsg}\n\n`
        doc += `💵 *Aposta:* ${formatCoins(betAmount)}\n`
        doc += `💰 *Retorno:* ${winAmount > 0 ? "+" + formatCoins(winAmount) : "-" + formatCoins(betAmount)}\n`
        doc += `🪙 *Novo Saldo:* ${formatCoins(user.coins)}`

        return reply(doc.trim())
    }
}
