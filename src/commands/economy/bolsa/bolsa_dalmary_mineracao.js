const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'bolsa_dalmary_mineracao',
    aliases: ["cmd_bolsa_dalmary_mineracao","atalho_bolsa_dalmary_mineracao","abrev_bolsa_dalmary_mineracao"],
    category: 'economy',
    subcategory: 'Pregão Regional',
    description: 'Índice de mercado de MINERACAO na região de DALMARY',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const q = stockMarketService.getQuote('MELI3')
        let txt = '╔═══════ 📊 *BOLSA REGIONAL: DALMARY (MINERACAO)* ═══════╗\n\n'
        txt += '📈 *Volume Regional Transacionado:* ' + (Math.floor(Math.random() * 80000 + 10000)).toLocaleString('pt-BR') + ' moedas\n'
        txt += '🏢 *Empresas Ativas Listadas:* 12 companhias\n'
        txt += '⭐ *Taxa Básica Regional:* 6.5% a.a.\n\n'
        txt += 'Consulte o pregão geral com `.bolsa_valores`.'
        return reply(txt.trim())
    }
}
