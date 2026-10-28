const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'bolsa_floresta_fadas_segurança',
    aliases: ["cmd_bolsa_floresta_fadas_segurança","atalho_bolsa_floresta_fadas_segurança","abrev_bolsa_floresta_fadas_segurança"],
    category: 'economy',
    subcategory: 'Pregão Regional',
    description: 'Índice de mercado de SEGURANÇA na região de FLORESTA_FADAS',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const q = stockMarketService.getQuote('MELI3')
        let txt = '╔═══════ 📊 *BOLSA REGIONAL: FLORESTA_FADAS (SEGURANÇA)* ═══════╗\n\n'
        txt += '📈 *Volume Regional Transacionado:* ' + (Math.floor(Math.random() * 80000 + 10000)).toLocaleString('pt-BR') + ' moedas\n'
        txt += '🏢 *Empresas Ativas Listadas:* 12 companhias\n'
        txt += '⭐ *Taxa Básica Regional:* 6.5% a.a.\n\n'
        txt += 'Consulte o pregão geral com `.bolsa_valores`.'
        return reply(txt.trim())
    }
}
