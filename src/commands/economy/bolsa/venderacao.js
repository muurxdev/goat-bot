const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'venderacao',
    aliases: ["cmd_venderacao","atalho_venderacao","abrev_venderacao"],
    category: 'economy',
    subcategory: 'Investimentos',
    description: 'Vende cotas de ações na bolsa: .venderacao <ticker> <quantidade>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.venderacao <ticker> <quantidade>`\nExemplo: `.venderacao MELI3 5`')
        const ticker = args[0].toUpperCase()
        const shares = parseInt(args[1], 10) || 1
        const res = stockMarketService.sellStock(sender, ticker, shares)
        if (!res.success) return reply(res.message)

        const lucroIcon = res.profit >= 0 ? '🟢 Lucro' : '🔴 Prejuízo'
        let txt = '✅ *ORDEM DE VENDA EXECUTADA COM SUCESSO!*\n\n'
        txt += `📄 *Protocolo:* ${res.orderId}\n`
        txt += `🏢 *Ativo:* ${res.quote.code} - ${res.quote.name}\n`
        txt += `📦 *Cotas Vendidas:* ${res.shares.toLocaleString('pt-BR')}\n`
        txt += `💰 *Preço de Venda:* ${res.quote.price.toLocaleString('pt-BR')} moedas\n`
        txt += `💵 *Receita Total Bruta:* ${res.totalRevenue.toLocaleString('pt-BR')} moedas\n`
        txt += `${lucroIcon}: ${res.profit.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Novo Saldo em Carteira:* ${res.newBalance.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
