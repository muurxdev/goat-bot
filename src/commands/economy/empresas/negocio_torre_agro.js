const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_torre_agro',
    aliases: ["cmd_negocio_torre_agro","atalho_negocio_torre_agro","abrev_negocio_torre_agro"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia agro no polo comercial de torre',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: TORRE - AGRO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de torre\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
