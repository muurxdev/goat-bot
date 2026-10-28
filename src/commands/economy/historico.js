const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { formatCoins } = require("../../utils/uiEngine")
const logger = require("../../core/logger")

const TYPE_LABELS = {
    crime: "🦹 Crime",
    crime_loss: "💀 Multa Crime",
    crime_gain: "💰 Lucro Crime",
    cassino: "🎰 Caça-Níquel",
    casino_bet: "🎰 Aposta Cassino",
    cassino_win: "🎉 Vitória Cassino",
    cassino_loss: "💸 Derrota Cassino",
    slots: "🎰 Slots",
    slots_bet: "🎰 Aposta Slots",
    crash_bet: "🚀 Aposta Crash",
    crash_cashout: "🚀 Cashout Crash",
    mines_bet: "⛏️ Aposta Mines",
    mines_cashout: "⛏️ Coleta Mines",
    mines_loss: "💥 Derrota Mines",
    pay: "💸 Transferência",
    pay_sent: "💸 Enviado",
    pay_received: "💰 Recebido",
    banco_deposit: "🏦 Depósito",
    banco_withdraw: "🏦 Saque",
    banco_invest: "📈 Investimento",
    banco_invest_return: "📈 Rendimento",
    daily: "📅 Prêmio Diário",
    daily_claim: "📅 Prêmio Diário",
    work: "💼 Trabalho",
    pescar: "🎣 Pescaria",
    minerar: "⛏️ Mineração",
    premiodiario: "🎡 Roleta Diária",
    roleta_diaria: "🎡 Roleta",
    divida: "📝 Dívida",
    divida_quit: "📝 Quitação",
    divida_pago: "📝 Pagamento",
    relatorio: "📋 Relatório",
    ranking: "🏆 Ranking",
    roubo: "🦹 Roubo",
    roubo_success: "💰 Roubo Sucesso",
    roubo_fail: "🚔 Falha Roubo",
    cofre: "🔐 Cofre",
    cofre_deposit: "📥 Depósito Cofre",
    cofre_withdraw: "📤 Saque Cofre",
    cartao: "💳 Cartão de Crédito",
    cartao_bill: "💳 Fatura Cartão",
    acoes: "📊 Ações",
    acoes_buy: "📊 Compra Ação",
    acoes_sell: "📊 Venda Ação",
    dividentos: "💵 Dividendos",
    dividends: "💵 Dividendos",
    bmv: "📊 Bolsa de Valores",
    cambio: "💱 Câmbio",
    investir: "📈 Investimento",
    premio: "🎁 Prêmio",
    bingo: "🎱 Bingo",
    bingo_bet: "🎱 Aposta Bingo",
    duelo: "⚔️ Duelo",
    duelo_win: "⚔️ Vitória Duelo",
    duelo_loss: "💀 Derrota Duelo",
    dueloaposta: "💰 Duelo Aposta",
    antecedentes: "📋 Antecedentes",
    antecedentes_pay: "📋 Pagamento Antecedentes",
    caixasurpresa: "📦 Caixa Surpresa",
    caixasurpresa_open: "📦 Caixa Aberta",
    streak: "🔥 Streak",
    streak_claim: "🔥 Recompensa Streak",
    poedeira: "🐔 Poedeira",
    poedeira_collect: "🐔 Coleta Poedeira",
    rendafixa: "📈 Renda Fixa",
    leilao: "🏷️ Leilão",
    leilao_bid: "🏷️ Lance Leilão",
    leilao_win: "🏆 Leilão Ganho",
    loteria: "🎰 Loteria",
    lotofacil: "🎰 Lotofácil",
    patrocinio: "🎁 Patrocínio",
    drop: "🌧️ Drop",
    champzu: "🐉 ChampZu",
    adivinhacao: "❓ Adivinhação"
}

module.exports = {
    name: "historico",
    aliases: ["history","hist","transacoes","cmd_historico","alt_historico","atalho_historico","abrev_historico","call_historico","func_historico"],
    category: "economy",
    subcategory: "Financeiro",
    description: "Veja suas últimas 10 transações",
    cooldownMs: 10000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const history = user.transactionHistory || []

        if (history.length === 0) {
            return reply("📋 *HISTÓRICO DE TRANSAÇÕES*\n\n_Nenhuma transação registrada._\n\n💡 Suas transações aparecerão aqui ao usar comandos econômicos.")
        }

        const last10 = history.slice(-10).reverse()

        let doc = "╔══════════════════════════════╗\n"
        doc += "║   📋 *HISTÓRICO DE TRANSAÇÕES* 📋   ║\n"
        doc += "╚══════════════════════════════╝\n\n"

        for (let i = 0; i < last10.length; i++) {
            const tx = last10[i]
            const label = TYPE_LABELS[tx.type] || `📝 ${tx.type}`
            const amount = tx.amount >= 0 ? `+${formatCoins(tx.amount)}` : `-${formatCoins(Math.abs(tx.amount))}`
            const emoji = tx.amount >= 0 ? "🟢" : "🔴"
            const date = new Date(tx.timestamp)
            const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
            const dateStr = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`

            doc += `${emoji} *${label}*\n`
            doc += `   💰 ${amount}\n`
            if (tx.multiplier) doc += `   📊 ${tx.multiplier}x\n`
            if (tx.symbols) doc += `   🎰 ${tx.symbols.join(" | ")}\n`
            doc += `   📅 ${dateStr} ${timeStr}\n`
            if (i < last10.length - 1) doc += `\n`
        }

        doc += `\n📊 *Total de Transações:* ${history.length}`
        if (history.length > 10) {
            doc += ` (mostrando últimas 10)`
        }

        return reply(doc.trim())
    }
}
