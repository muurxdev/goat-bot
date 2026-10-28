const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_floresta_fadas_agro',
    aliases: ["cmd_negocio_floresta_fadas_agro","atalho_negocio_floresta_fadas_agro","abrev_negocio_floresta_fadas_agro"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia agro no polo comercial de floresta_fadas',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: FLORESTA_FADAS - AGRO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de floresta_fadas\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
