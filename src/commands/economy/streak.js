const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { formatCoins } = require("../../utils/uiEngine")
const logger = require("../../core/logger")

const COOLDOWN_24H = 24 * 60 * 60 * 1000
function calculateStreakReward(streak) {
    const s = Math.max(1, streak || 1);
    return (100 * s) + (Math.floor(s / 10) * 500);
}

module.exports = {
    name: "streak",
    aliases: ["sequencia","dias","streakdiario","chain","cmd_streak","alt_streak","atalho_streak","abrev_streak","call_streak","func_streak"],
    category: "economy",
    subcategory: "Diário",
    description: "Mantenha sua sequência de dias e ganhe recompensas infinitas!",
    cooldownMs: 86400000,
    execute: async ({ sender, args, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const subcommand = (args[0] || "").toLowerCase()
        const now = Date.now()

        const lastStreak = user.lastStreak || 0
        const currentStreak = user.streak || 0

        const diasDesdeUltimo = lastStreak > 0 ? Math.floor((now - lastStreak) / COOLDOWN_24H) : 0

        if (subcommand === "claim" || subcommand === "coletar" || subcommand === "resgatar") {
            if (lastStreak > 0 && (now - lastStreak) < COOLDOWN_24H) {
                const horasRestantes = Math.ceil((COOLDOWN_24H - (now - lastStreak)) / (60 * 60 * 1000))
                return reply(`⏳ Você já coletou sua recompensa hoje! Volte em *${horasRestantes}h*.`)
            }

            if (lastStreak > 0 && diasDesdeUltimo === 1) {
                user.streak = currentStreak + 1
            } else if (lastStreak > 0 && diasDesdeUltimo > 1) {
                user.streak = 1
            } else {
                user.streak = Math.max(1, currentStreak)
            }

            const streak = user.streak
            const reward = calculateStreakReward(streak)

            user.coins = (user.coins || 0) + reward
            user.lastStreak = now

            if (!user.transactionHistory) user.transactionHistory = []
            user.transactionHistory.push({
                type: "streak_claim",
                amount: reward,
                streak: streak,
                timestamp: now
            })
            if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

            await dataService.saveXpData(xpData)
            logger.info(`[STREAK] ${sender} claim streak ${streak}, reward ${reward}`)

            let doc = "╔══════════════════════════════╗\n"
            doc += "║   🔥 *STREAK DIÁRIO* 🔥   ║\n"
            doc += "╚══════════════════════════════╝\n\n"
            doc += `🔥 *Seu Streak:* ${streak} dias (Progressão Infinita)\n`
            doc += `💰 *Recompensa Coletada:* +${formatCoins(reward)}\n`
            doc += `🪙 *Novo Saldo:* ${formatCoins(user.coins)}\n\n`

            if (streak >= 30) {
                doc += `👑 *Transcendência! Sequência épica de ${streak} dias ininterruptos!*\n`
            } else if (streak >= 10) {
                doc += `⭐ *Lenda dos Grupos! Streak de ${streak} dias!*\n`
            } else if (streak >= 5) {
                doc += `✨ *Incrível! ${streak} dias seguidos!*\n`
            } else {
                const nextReward = calculateStreakReward(streak + 1)
                doc += `📈 Continue amanhã para ganhar ${formatCoins(nextReward)}!\n`
            }

            doc += `⏳ Próxima coleta em 24h`

            return reply(doc.trim())
        }

        let doc = "╔══════════════════════════════╗\n"
        doc += "║   🔥 *STREAK DIÁRIO* 🔥   ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += `🔥 *Streak Atual:* ${currentStreak} dias\n`

        if (lastStreak > 0) {
            const horasRestantes = Math.ceil((COOLDOWN_24H - (now - lastStreak)) / (60 * 60 * 1000))
            if (horasRestantes > 0) {
                doc += `⏳ *Próxima coleta em:* ${horasRestantes}h\n`
            } else {
                doc += `✅ *Recompensa disponível!*\n`
                doc += `📌 Use \`.streak claim\` para coletar\n`
            }
        } else {
            doc += `📌 Use \`.streak claim\` para começar seu streak!\n`
        }

        doc += `\n📊 *Sistema de Recompensas (Ilimitado):*\n`
        doc += `• 1 dia = ${formatCoins(100)}\n`
        doc += `• 5 dias = ${formatCoins(500)}\n`
        doc += `• 10 dias = ${formatCoins(1500)} (+500 bônus de marco)\n`
        doc += `• 30 dias = ${formatCoins(4500)} (+1.500 bônus de marco)\n`
        doc += `• ♾️ Sem limite máximo: cada dia e cada marco ampliam seu prêmio continuamente!\n\n`
        doc += `⚠️ *Atenção:* Se perder 1 dia, o streak reseta!\n`
        doc += `🪙 *Saldo Atual:* ${formatCoins(user.coins || 0)}`

        return reply(doc.trim())

        return reply(doc.trim())
    }
}
