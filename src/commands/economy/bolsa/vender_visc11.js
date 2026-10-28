const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'vender_visc11',
    aliases: ["cmd_vender_visc11","atalho_vender_visc11","abrev_vender_visc11"],
    category: 'economy',
    subcategory: 'Ordens Rápidas',
    description: 'Venda rápida de cotas de VISC11: .vender_visc11 [quantidade]',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        const shares = parseInt(args[0], 10) || 1
        const res = stockMarketService.sellStock(sender, 'VISC11', shares)
        if (!res.success) return reply(res.message)

        let txt = '✅ *ORDEM RÁPIDA DE VENDA EXECUTADA!*\n\n'
        txt += `🏢 *Ativo:* ${res.quote.code} (${res.quote.name})\n`
        txt += `📦 *Cotas Vendidas:* ${res.shares.toLocaleString('pt-BR')}\n`
        txt += `💵 *Receita:* ${res.totalRevenue.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Novo Saldo:* ${res.newBalance.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
