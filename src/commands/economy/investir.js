/**
 * Comando .investir
 * Investe moedas no Mercado Financeiro e Criptomoedas com flutuação de rendimento
 */

const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

const ATIVOS = [
    { nome: "Ações da Taverna do Javali", volatilidade: "Média", tipo: "Ações" },
    { nome: "Cripto GOATCoin (MLD)", volatilidade: "Alta", tipo: "Cripto" },
    { nome: "Títulos do Tesouro Central", volatilidade: "Baixa", tipo: "Renda Fixa" },
    { nome: "Fundo Imobiliário do Reino", volatilidade: "Baixa", tipo: "FII" }
]

module.exports = {
    name: "investir",
    aliases: ["invest","investimento","investircoins","cmd_investir","alt_investir","atalho_investir","abrev_investir","call_investir","func_investir"],
    category: "economy",
    subcategory: "Investimento",
    description: "Invista moedas no mercado do Reino e veja se rendem. Uma rodada a cada 30 min",
    usage: "<valor>",
    examples: [" — mostra os ativos e como investir", "500 — investe 500 moedas"],
    cooldownMs: 2000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName()
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!args[0]) {
            let help = "╔══════════════════════════════╗\n"
            help += "║   📈 *BOLSA DE VALORES & CRYPTO* 📈  ║\n"
            help += "╚══════════════════════════════╝\n\n"
            help += "📌 *Como Investir:* \`.investir <valor>\`\n\n"
            help += "📊 *Ativos Disponíveis no Mercado:*\n"
            ATIVOS.forEach(a => {
                help += "• *" + a.nome + "* (" + a.tipo + " — Volatilidade: " + a.volatilidade + ")\n"
            })
            help += "\n💰 *Seu Saldo na Carteira:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins"
            return reply(help.trim())
        }

        const now = Date.now()
        const lastInvest = user.lastInvest || 0
        const COOLDOWN_INVEST = 30 * 60 * 1000 // 30 minutos

        if (now - lastInvest < COOLDOWN_INVEST) {
            const rem = COOLDOWN_INVEST - (now - lastInvest)
            const m = Math.floor(rem / 60000)
            const s = Math.floor((rem % 60000) / 1000)
            return reply("⏳ *O pregão da bolsa está em intervalo!*\n\nAguarde *" + m + "m " + s + "s* para a próxima rodada de negociações.")
        }

        const investAmount = parseInt(args[0], 10)
        if (isNaN(investAmount) || investAmount <= 0) {
            return reply("❌ O valor a investir deve ser um número positivo maior que zero.")
        }

        if ((user.coins || 0) < investAmount) {
            return reply("❌ Saldo insuficiente na carteira! Você possui *" + (user.coins || 0).toLocaleString("pt-BR") + " Coins*.")
        }

        user.lastInvest = now
        const ativo = ATIVOS[Math.floor(Math.random() * ATIVOS.length)]

        // Flutuação de -35% a +65%
        const rate = (Math.floor(Math.random() * 101) - 35) / 100
        const profitOrLoss = Math.floor(investAmount * rate)

        if (profitOrLoss >= 0) {
            user.coins = (user.coins || 0) + profitOrLoss
        } else {
            user.coins = Math.max(0, (user.coins || 0) + profitOrLoss)
        }

        await dataService.saveXpData(xpData)
        logger.info("[INVEST] " + sender + " investiu " + investAmount + " em " + ativo.nome + " e obteve " + profitOrLoss)

        let doc = "╔══════════════════════════════╗\n"
        doc += "║    📈 *RELATÓRIO DE INVESTIMENTO* 📈   ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += "📊 *Ativo Operado:* *" + ativo.nome + "* (" + ativo.tipo + ")\n"
        doc += "💵 *Capital Aportado:* " + investAmount.toLocaleString("pt-BR") + " Coins\n\n"
        doc += "╭━〔 📈 PERFORMANCE DO MERCADO 〕━⬣\n"

        if (profitOrLoss >= 0) {
            doc += "┃ 🟢 *Variação:* +" + Math.round(rate * 100) + "% (ALTA)\n"
            doc += "┃ 💵 *Lucro Realizado:* +" + profitOrLoss.toLocaleString("pt-BR") + " Coins\n"
            doc += "┃ 💰 *Novo Saldo:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins\n"
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n"
            doc += "🚀 _Excelente timing de mercado!_"
        } else {
            doc += "┃ 🔴 *Variação:* " + Math.round(rate * 100) + "% (BAIXA)\n"
            doc += "┃ 💸 *Desvalorização:* " + profitOrLoss.toLocaleString("pt-BR") + " Coins\n"
            doc += "┃ 💰 *Novo Saldo:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins\n"
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n"
            doc += "📉 _O mercado oscilou para baixo. Diversifique seus ativos!_"
        }

        doc += "\n\n👑 *" + botName + "*"
        return reply(doc.trim(), [sender])
    }
}
