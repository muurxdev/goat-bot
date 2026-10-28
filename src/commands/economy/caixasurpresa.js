const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { formatCoins } = require("../../utils/uiEngine")
const logger = require("../../core/logger")

const BOX_COST = 500
const COOLDOWN_1H = 60 * 60 * 1000

module.exports = {
    name: "caixasurpresa",
    aliases: ["mysterybox","caixa","surpresabox","cmd_caixasurpresa","alt_caixasurpresa","atalho_caixasurpresa","abrev_caixasurpresa","call_caixasurpresa","func_caixasurpresa"],
    category: "economy",
    subcategory: "Itens",
    description: "Abra uma caixa surpresa por 500 coins e ganhe prêmios!",
    cooldownMs: 3600000,
    execute: async ({ sender, args, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if ((user.coins || 0) < BOX_COST) {
            return reply(`❌ Saldo insuficiente! A caixa custa ${formatCoins(BOX_COST)}.\n💰 Seu saldo: ${formatCoins(user.coins || 0)}`)
        }

        const lastBox = user.lastCaixaSurpresa || 0
        const now = Date.now()
        if (now - lastBox < COOLDOWN_1H) {
            const horasRestantes = Math.ceil((COOLDOWN_1H - (now - lastBox)) / (60 * 60 * 1000))
            return reply(`⏳ Aguarde *${horasRestantes}h* para abrir outra caixa surpresa!`)
        }

        user.coins = (user.coins || 0) - BOX_COST
        user.lastCaixaSurpresa = now

        const roll = Math.random() * 100
        let reward
        let rarity
        let emoji

        if (roll < 10) {
            reward = 5000
            rarity = "🟡 LENDÁRIO"
            emoji = "🌟💎"
        } else if (roll < 40) {
            reward = 1000
            rarity = "🟣 ÉPICO"
            emoji = "✨🔮"
        } else {
            reward = 200
            rarity = "⚪ COMUM"
            emoji = "📦🎁"
        }

        user.coins = (user.coins || 0) + reward

        if (!user.transactionHistory) user.transactionHistory = []
        user.transactionHistory.push({
            type: "caixasurpresa_open",
            amount: reward - BOX_COST,
            cost: BOX_COST,
            rarity: rarity,
            timestamp: now
        })
        if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

        await dataService.saveXpData(xpData)
        logger.info(`[CAIXASURPRESA] ${sender} abriu caixa, rarity: ${rarity}, reward: ${reward}`)

        let doc = "╔══════════════════════════════╗\n"
        doc += "║   📦 *CAIXA SURPRESA* 📦   ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += `${emoji}\n\n`
        doc += `🎯 *Raridade:* ${rarity}\n`
        doc += `💰 *Prêmio:* +${formatCoins(reward)}\n`
        doc += `💵 *Custo:* -${formatCoins(BOX_COST)}\n`
        doc += `🪙 *Novo Saldo:* ${formatCoins(user.coins)}\n\n`
        doc += `⏳ Próxima caixa em 1h`

        return reply(doc.trim())
    }
}
