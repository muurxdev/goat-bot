const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'bolsa_central_magia',
    aliases: ["cmd_bolsa_central_magia","atalho_bolsa_central_magia","abrev_bolsa_central_magia"],
    category: 'economy',
    subcategory: 'Pregão Regional',
    description: 'Índice de mercado de MAGIA na região de CENTRAL',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const q = stockMarketService.getQuote('MELI3')
        let txt = '╔═══════ 📊 *BOLSA REGIONAL: CENTRAL (MAGIA)* ═══════╗\n\n'
        txt += '📈 *Volume Regional Transacionado:* ' + (Math.floor(Math.random() * 80000 + 10000)).toLocaleString('pt-BR') + ' moedas\n'
        txt += '🏢 *Empresas Ativas Listadas:* 12 companhias\n'
        txt += '⭐ *Taxa Básica Regional:* 6.5% a.a.\n\n'
        txt += 'Consulte o pregão geral com `.bolsa_valores`.'
        return reply(txt.trim())
    }
}
