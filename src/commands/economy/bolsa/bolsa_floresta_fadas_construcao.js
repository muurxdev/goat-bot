const stockMarketService = require('../../../services/stockMarketService')

module.exports = {
    name: 'bolsa_floresta_fadas_construcao',
    aliases: ["cmd_bolsa_floresta_fadas_construcao","atalho_bolsa_floresta_fadas_construcao","abrev_bolsa_floresta_fadas_construcao"],
    category: 'economy',
    subcategory: 'Pregão Regional',
    description: 'Índice de mercado de CONSTRUCAO na região de FLORESTA_FADAS',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const q = stockMarketService.getQuote('MELI3')
        let txt = '╔═══════ 📊 *BOLSA REGIONAL: FLORESTA_FADAS (CONSTRUCAO)* ═══════╗\n\n'
        txt += '📈 *Volume Regional Transacionado:* ' + (Math.floor(Math.random() * 80000 + 10000)).toLocaleString('pt-BR') + ' moedas\n'
        txt += '🏢 *Empresas Ativas Listadas:* 12 companhias\n'
        txt += '⭐ *Taxa Básica Regional:* 6.5% a.a.\n\n'
        txt += 'Consulte o pregão geral com `.bolsa_valores`.'
        return reply(txt.trim())
    }
}
