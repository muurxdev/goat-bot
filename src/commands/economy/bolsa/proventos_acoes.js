const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'proventos_acoes',
    aliases: ["cmd_proventos_acoes","atalho_proventos_acoes","abrev_proventos_acoes"],
    category: 'economy',
    subcategory: 'Investimentos',
    description: 'Recolhe dividendos e proventos diários das ações da sua carteira',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const res = stockMarketService.claimDividends(sender)
        if (!res.success) return reply(res.message)

        let txt = '🎉 *PAGAMENTO DE PROVENTOS & DIVIDENDOS!*\n\n'
        txt += `💰 *Total Creditado:* +${res.totalDividends.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Novo Saldo em Carteira:* ${res.newBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '╭━〔 📋 DETALHAMENTO DE PROVENTOS 〕━⬣\n'
        for (const d of res.details) {
            txt += `┃ 💸 *${d.ticker}:* ${d.amount.toLocaleString('pt-BR')} moedas (${d.shares} cotas)\n`
        }
        txt += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
        txt += '💡 Reinvista seus dividendos com `.compraracao` para acelerar seus juros compostos!'
        return reply(txt.trim())
    }
}
