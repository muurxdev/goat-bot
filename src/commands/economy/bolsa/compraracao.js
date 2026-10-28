const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'compraracao',
    aliases: ["cmd_compraracao","atalho_compraracao","abrev_compraracao"],
    category: 'economy',
    subcategory: 'Investimentos',
    description: 'Compra cotas de ações na bolsa: .compraracao <ticker> <quantidade>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.compraracao <ticker> <quantidade>`\nExemplo: `.compraracao MELI3 10`')
        const ticker = args[0].toUpperCase()
        const shares = parseInt(args[1], 10) || 1
        const res = stockMarketService.buyStock(sender, ticker, shares)
        if (!res.success) return reply(res.message)

        let txt = '🎉 *ORDEM DE COMPRA EXECUTADA COM SUCESSO!*\n\n'
        txt += `📄 *Protocolo:* ${res.orderId}\n`
        txt += `🏢 *Ativo:* ${res.quote.code} - ${res.quote.name}\n`
        txt += `📦 *Quantidade:* ${res.shares.toLocaleString('pt-BR')} cotas\n`
        txt += `💰 *Preço por Cota:* ${res.quote.price.toLocaleString('pt-BR')} moedas\n`
        txt += `💸 *Valor Total Investido:* ${res.totalCost.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Restante:* ${res.remainingBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Consulte seus ativos com `.carteira_acoes`.'
        return reply(txt.trim())
    }
}
