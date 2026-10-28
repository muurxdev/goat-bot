const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'bolsa_floresta_fadas_educacao',
    aliases: ["cmd_bolsa_floresta_fadas_educacao","atalho_bolsa_floresta_fadas_educacao","abrev_bolsa_floresta_fadas_educacao"],
    category: 'economy',
    subcategory: 'Pregão Regional',
    description: 'Índice de mercado de EDUCACAO na região de FLORESTA_FADAS',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const q = stockMarketService.getQuote('MELI3')
        let txt = '╔═══════ 📊 *BOLSA REGIONAL: FLORESTA_FADAS (EDUCACAO)* ═══════╗\n\n'
        txt += '📈 *Volume Regional Transacionado:* ' + (Math.floor(Math.random() * 80000 + 10000)).toLocaleString('pt-BR') + ' moedas\n'
        txt += '🏢 *Empresas Ativas Listadas:* 12 companhias\n'
        txt += '⭐ *Taxa Básica Regional:* 6.5% a.a.\n\n'
        txt += 'Consulte o pregão geral com `.bolsa_valores`.'
        return reply(txt.trim())
    }
}
