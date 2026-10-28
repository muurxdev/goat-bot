const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'comprar_vale3',
    aliases: ["cmd_comprar_vale3","atalho_comprar_vale3","abrev_comprar_vale3"],
    category: 'economy',
    subcategory: 'Ordens Rápidas',
    description: 'Compra rápida de cotas de VALE3: .comprar_vale3 [quantidade]',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        const shares = parseInt(args[0], 10) || 1
        const res = stockMarketService.buyStock(sender, 'VALE3', shares)
        if (!res.success) return reply(res.message)

        let txt = '🎉 *ORDEM RÁPIDA DE COMPRA EXECUTADA!*\n\n'
        txt += `🏢 *Ativo:* ${res.quote.code} (${res.quote.name})\n`
        txt += `📦 *Cotas Adquiridas:* ${res.shares.toLocaleString('pt-BR')}\n`
        txt += `💰 *Custo por Cota:* ${res.quote.price.toLocaleString('pt-BR')} moedas\n`
        txt += `💸 *Total Pago:* ${res.totalCost.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Restante:* ${res.remainingBalance.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
