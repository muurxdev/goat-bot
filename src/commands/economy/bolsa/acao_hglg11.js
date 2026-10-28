const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'acao_hglg11',
    aliases: ["cmd_acao_hglg11","atalho_acao_hglg11","abrev_acao_hglg11"],
    category: 'economy',
    subcategory: 'Ações da Bolsa',
    description: 'Análise detalhada e cotação da ação HGLG11 (Galpões Reais Central)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const q = stockMarketService.getQuote('HGLG11')
        if (!q) return reply('Ativo temporariamente indisponível no pregão.')
        const icon = q.isUp ? '📈' : '📉'
        const sign = q.variation >= 0 ? '+' : ''

        let txt = `╔═══════ ${icon} *${q.code}* ═══════╗\n\n`
        txt += `🏢 *Empresa:* ${q.name}\n`
        txt += `🏷️ *Setor:* ${q.sector}\n`
        txt += `💰 *Preço Atual:* ${q.price.toLocaleString('pt-BR')} moedas\n`
        txt += `📊 *Variação 24h:* ${sign}${q.variation}%\n`
        txt += `💸 *Dividend Yield:* ${(q.divYield * 100).toFixed(1)}% a.a.\n`
        txt += `📦 *Volume do Pregão:* ${q.volume.toLocaleString('pt-BR')} cotas\n\n`
        txt += '💡 *Operações:*\n'
        txt += `├ Comprar: \`.compraracao ${s.code} <qtd>\`\n`
        txt += `└ Vender: \`.venderacao ${s.code} <qtd>\`\n`
        return reply(txt.trim())
    }
}
