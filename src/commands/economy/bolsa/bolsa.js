const stockMarketService = require('../../../services/stockMarketService')
const { getBotName } = require('../../../config/botConfig')

module.exports = {
    name: 'bolsa_valores',
    aliases: ["cmd_bolsa_valores","atalho_bolsa_valores","abrev_bolsa_valores"],
    category: 'economy',
    subcategory: 'Investimentos',
    description: 'Painel completo da Bolsa de Valores de Reino com cotações e variações',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const quotes = stockMarketService.getAllQuotes()
        let txt = '╔══════════════════════════════╗\n'
        txt += '║   📈 *BOLSA DE VALORES DE REINO* 📈   ║\n'
        txt += '╚══════════════════════════════╝\n\n'
        txt += 'Operações em tempo real com liquidez diária.\n\n'

        // Agrupa por categoria
        const topQuotes = quotes.slice(0, 15)
        for (const q of topQuotes) {
            const icon = q.isUp ? '🟢' : '🔴'
            const sign = q.variation >= 0 ? '+' : ''
            txt += `${icon} *${q.code}* - ${q.name}\n`
            txt += `   └ Preço: *${q.price.toLocaleString('pt-BR')} moedas* | Var: *${sign}${q.variation}%*\n`
        }

        txt += '\n💡 *Como operar:*\n'
        txt += '├ Cotar: `.cotacao <ticker>`\n'
        txt += '├ Comprar: `.compraracao <ticker> <quantidade>`\n'
        txt += '├ Vender: `.venderacao <ticker> <quantidade>`\n'
        txt += '├ Carteira: `.carteira_acoes`\n'
        txt += '└ Proventos: `.dividendos`\n\n'
        txt += `👑 *${getBotName()}*`
        return reply(txt.trim())
    }
}
