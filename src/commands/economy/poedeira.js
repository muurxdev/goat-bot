const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { formatCoins } = require("../../utils/uiEngine")
const logger = require("../../core/logger")

const COINS_PER_MINUTE = 10
const MAX_MINUTES = 24 * 60
const COOLDOWN_5MIN = 5 * 60 * 1000

module.exports = {
    name: "poedeira",
    aliases: ["galinha","ganhapertempo","passivet","rendapassiva","cmd_poedeira","alt_poedeira","atalho_poedeira","abrev_poedeira","call_poedeira","func_poedeira"],
    category: "economy",
    subcategory: "Renda",
    description: "Galinha poedeira acumula coins por tempo (10 coins/min, máx 24h)",
    cooldownMs: 300000,
    execute: async ({ sender, args, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const subcommand = (args[0] || "").toLowerCase()
        const now = Date.now()

        if (subcommand === "collect" || subcommand === "coletar" || subcommand === "pegar") {
            const lastPoedeira = user.lastPoedeira || now
            const elapsed = now - lastPoedeira
            const elapsedMinutes = Math.min(Math.floor(elapsed / 60000), MAX_MINUTES)

            if (elapsedMinutes < 1 && lastPoedeira === now) {
                return reply("🐔 Sua galinha ainda não botou ovos! Aguarde pelo menos 1 minuto.")
            }

            const earned = elapsedMinutes * COINS_PER_MINUTE

            if (earned <= 0) {
                return reply("🐔 Sua galinha ainda não produziu ovos! Aguarde mais tempo.")
            }

            user.coins = (user.coins || 0) + earned
            user.lastPoedeira = now

            if (!user.transactionHistory) user.transactionHistory = []
            user.transactionHistory.push({
                type: "poedeira_collect",
                amount: earned,
                minutes: elapsedMinutes,
                timestamp: now
            })
            if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

            await dataService.saveXpData(xpData)
            logger.info(`[POEDEIRA] ${sender} coletou ${earned} coins (${elapsedMinutes} min)`)

            let doc = "╔══════════════════════════════╗\n"
            doc += "║   🐔 *POEDEIRA - OVOS COLETADOS!* 🐔   ║\n"
            doc += "╚══════════════════════════════╝\n\n"
            doc += `🥚 *Ovos Produzidos:* ${elapsedMinutes} min\n`
            doc += `💰 *Moedas Coletadas:* +${formatCoins(earned)}\n`
            doc += `🪙 *Novo Saldo:* ${formatCoins(user.coins)}\n\n`
            doc += `🐔 Sua galinha continua botando ovos!\n`
            doc += `📌 Use \`.poedeira collect\` para coletar novamente`

            return reply(doc.trim())
        }

        const lastPoedeira = user.lastPoedeira || now
        const elapsed = now - lastPoedeira
        const elapsedMinutes = Math.min(Math.floor(elapsed / 60000), MAX_MINUTES)
        const accumulated = elapsedMinutes * COINS_PER_MINUTE
        const maxPossible = MAX_MINUTES * COINS_PER_MINUTE

        let doc = "╔══════════════════════════════╗\n"
        doc += "║     🐔 *GALINHA POEDEIRA* 🐔     ║\n"
        doc += "╚══════════════════════════════╝\n\n"

        if (user.lastPoedeira) {
            doc += `⏳ *Tempo Ativo:* ${elapsedMinutes} min\n`
            doc += `🥚 *Ovos Acumulados:* ${elapsedMinutes}\n`
            doc += `💰 *Moedas Disponíveis:* ${formatCoins(accumulated)}\n`
            doc += `📊 *Cap Máximo:* ${formatCoins(maxPossible)} (24h)\n\n`

            if (accumulated > 0) {
                doc += `✅ *Sua galinha está produtiva!*\n`
                doc += `📌 Use \`.poedeira collect\` para coletar\n`
            } else {
                doc += `⏳ Aguarde mais tempo para acumular coins\n`
            }
        } else {
            user.lastPoedeira = now
            await dataService.saveXpData(xpData)

            doc += `🐔 *Galinha Adquirida!*\n\n`
            doc += `📈 *Taxa:* ${COINS_PER_MINUTE} coins/minuto\n`
            doc += `⏰ *Cap Máximo:* ${MAX_MINUTES} minutos (24h)\n`
            doc += `💰 *Máximo Acumulável:* ${formatCoins(maxPossible)}\n\n`
            doc += `📌 Sua galinha começou a botar ovos!\n`
            doc += `📌 Use \`.poedeira collect\` para coletar seus coins`
        }

        return reply(doc.trim())
    }
}
