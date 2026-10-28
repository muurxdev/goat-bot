const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_torre_turismo',
    aliases: ["cmd_negocio_torre_turismo","atalho_negocio_torre_turismo","abrev_negocio_torre_turismo"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia turismo no polo comercial de torre',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: TORRE - TURISMO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de torre\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
