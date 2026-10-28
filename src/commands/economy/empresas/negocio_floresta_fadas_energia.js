const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_floresta_fadas_energia',
    aliases: ["cmd_negocio_floresta_fadas_energia","atalho_negocio_floresta_fadas_energia","abrev_negocio_floresta_fadas_energia"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia energia no polo comercial de floresta_fadas',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: FLORESTA_FADAS - ENERGIA* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de floresta_fadas\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
