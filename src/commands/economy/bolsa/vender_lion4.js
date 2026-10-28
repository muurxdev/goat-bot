const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'vender_lion4',
    aliases: ["cmd_vender_lion4","atalho_vender_lion4","abrev_vender_lion4"],
    category: 'economy',
    subcategory: 'Ordens Rápidas',
    description: 'Venda rápida de cotas de LION4: .vender_lion4 [quantidade]',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        const shares = parseInt(args[0], 10) || 1
        const res = stockMarketService.sellStock(sender, 'LION4', shares)
        if (!res.success) return reply(res.message)

        let txt = '✅ *ORDEM RÁPIDA DE VENDA EXECUTADA!*\n\n'
        txt += `🏢 *Ativo:* ${res.quote.code} (${res.quote.name})\n`
        txt += `📦 *Cotas Vendidas:* ${res.shares.toLocaleString('pt-BR')}\n`
        txt += `💵 *Receita:* ${res.totalRevenue.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Novo Saldo:* ${res.newBalance.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
