const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'carteira_acoes',
    aliases: ["cmd_carteira_acoes","atalho_carteira_acoes","abrev_carteira_acoes"],
    category: 'economy',
    subcategory: 'Investimentos',
    description: 'Exibe sua carteira de investimentos e rendimento atual na Bolsa',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const pf = stockMarketService.getPortfolio(sender)
        if (pf.items.length === 0) {
            return reply('💼 *Sua carteira de ações está vazia!*\n\nUse `.bolsa_valores` para conhecer os ativos e `.compraracao <ticker> <qtd>` para investir.')
        }

        let txt = '╔════════ 💼 *CARTEIRA DE INVESTIMENTOS* ════════╗\n\n'
        txt += `💰 *Total Investido:* ${pf.totalInvested.toLocaleString('pt-BR')} moedas\n`
        txt += `📈 *Valor Atual de Mercado:* ${pf.totalCurrent.toLocaleString('pt-BR')} moedas\n`
        const sign = pf.totalPnl >= 0 ? '+' : ''
        const pnlIcon = pf.totalPnl >= 0 ? '🟢' : '🔴'
        txt += `${pnlIcon} *Rentabilidade Geral:* ${sign}${pf.totalPnl.toLocaleString('pt-BR')} moedas (${sign}${pf.totalPnlPercent}%)\n\n`
        txt += '╭━〔 📊 SEUS ATIVOS EM CUSTÓDIA 〕━⬣\n'

        for (const it of pf.items) {
            const itemSign = it.pnl >= 0 ? '+' : ''
            const itemIcon = it.pnl >= 0 ? '🟢' : '🔴'
            txt += `┃ ${itemIcon} *${it.ticker}* (${it.name})\n`
            txt += `┃    ├ Quantidade: ${it.shares} cotas | PM: ${it.avgPrice.toLocaleString('pt-BR')} moedas\n`
            txt += `┃    └ Atual: ${it.currentPrice.toLocaleString('pt-BR')} moedas | P&L: ${itemSign}${it.pnlPercent}%\n`
        }
        txt += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
        txt += '💡 Digite `.dividendos` para recolher proventos diários.'
        return reply(txt.trim())
    }
}
