/**
 * Comando .rendafixa
 * Uma vez por dia, a pessoa escolhe um valor do próprio saldo e recebe 2% dele.
 * O valor continua na carteira.
 *
 * Tinha `cooldownMs` de 24h: só de abrir a tela (sem valor) o dispatcher já
 * contava o intervalo e o `.rendafixa <valor>` seguinte ficava bloqueado por um
 * dia. O intervalo real é o `lastRenda`, controlado aqui dentro.
 */

const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { formatCoins } = require("../../utils/uiEngine")
const logger = require("../../core/logger")

const COOLDOWN_24H = 24 * 60 * 60 * 1000
const DAILY_RATE = 0.02

function horasAte(ms) {
    return Math.max(1, Math.ceil(ms / (60 * 60 * 1000)))
}

module.exports = {
    name: "rendafixa",
    aliases: ["rendimento","rendfixo","investirrendimento","cmd_rendafixa","alt_rendafixa","atalho_rendafixa","abrev_rendafixa","call_rendafixa","func_rendafixa"],
    category: "economy",
    subcategory: "Investimentos",
    description: "Rende 2% de um valor do seu saldo, uma vez por dia",
    execute: async ({ sender, args, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const now = Date.now()
        const lastRenda = user.lastRenda || 0
        const falta = lastRenda > 0 ? COOLDOWN_24H - (now - lastRenda) : 0

        if (!args[0]) {
            const saldo = user.coins || 0
            let doc = `📈 *Renda fixa*\n\n`
            doc += `*Saldo:* ${formatCoins(saldo)}\n`
            doc += `*Taxa:* 2% ao dia\n`
            doc += `*Se aplicar tudo hoje:* +${formatCoins(Math.floor(saldo * DAILY_RATE))}\n\n`
            doc += falta > 0
                ? `⏳ Você já pegou o rendimento de hoje. O próximo sai em ${horasAte(falta)}h.\n\n`
                : `✅ O rendimento de hoje está disponível: \`.rendafixa <valor>\`\n\n`
            doc += `_Uma vez por dia você escolhe um valor do seu saldo e recebe 2% dele na hora. O valor continua na sua carteira._`
            return reply(doc)
        }

        const valor = parseInt(args[0], 10)
        if (isNaN(valor) || valor <= 0) {
            return reply("❓ Diga quanto aplicar, por exemplo: `.rendafixa 1000`")
        }

        if ((user.coins || 0) < valor) {
            return reply(`🪙 Você tem ${formatCoins(user.coins || 0)}, então não dá para aplicar ${formatCoins(valor)}.`)
        }

        if (falta > 0) {
            return reply(`⏳ Você já pegou o rendimento de hoje. Volte em ${horasAte(falta)}h.`)
        }

        const rendimento = Math.floor(valor * DAILY_RATE)
        user.coins = (user.coins || 0) + rendimento
        user.lastRenda = now

        if (!user.transactionHistory) user.transactionHistory = []
        user.transactionHistory.push({
            type: "rendafixa",
            amount: rendimento,
            applied: valor,
            timestamp: now
        })
        if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

        await dataService.saveXpData(xpData)
        logger.info(`[RENDAFIXA] ${sender} aplicou ${valor}, rendeu ${rendimento}`)

        return reply(
            `📈 Rendimento creditado: *+${formatCoins(rendimento)}*\n\n` +
            `*Valor aplicado:* ${formatCoins(valor)}\n` +
            `*Novo saldo:* ${formatCoins(user.coins)}\n\n` +
            `O próximo sai em 24h.`
        )
    }
}
