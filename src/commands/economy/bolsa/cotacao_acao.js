const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'cotacao_acao',
    aliases: ["cmd_cotacao_acao","atalho_cotacao_acao","abrev_cotacao_acao"],
    category: 'economy',
    subcategory: 'Investimentos',
    description: 'Consulta cotação e detalhes de um ativo na bolsa: .cotacao_acao <ticker>',
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const ticker = (args[0] || 'MELI3').toUpperCase()
        const q = stockMarketService.getQuote(ticker)
        if (!q) {
            return reply(`❌ Ticker *${ticker}* não encontrado no pregão. Use \`.bolsa_valores\` para ver a lista.`)
        }
        const icon = q.isUp ? '📈' : '📉'
        const sign = q.variation >= 0 ? '+' : ''

        let txt = `╔═══════ ${icon} *COTAÇÃO: ${q.code}* ═══════╗\n\n`
        txt += `🏢 *Empresa:* ${q.name}\n`
        txt += `🏷️ *Setor:* ${q.sector}\n`
        txt += `💰 *Preço Atual:* ${q.price.toLocaleString('pt-BR')} moedas\n`
        txt += `📊 *Variação 24h:* ${sign}${q.variation}%\n`
        txt += `💸 *Dividend Yield Anual:* ${(q.divYield * 100).toFixed(1)}%\n`
        txt += `📦 *Volume Negociado:* ${q.volume.toLocaleString('pt-BR')} cotas\n\n`
        txt += `💡 Digite \`.compraracao ${q.code} 1\` para adquirir cotas.`
        return reply(txt.trim())
    }
}
