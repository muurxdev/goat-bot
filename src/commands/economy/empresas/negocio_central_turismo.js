const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_central_turismo',
    aliases: ["cmd_negocio_central_turismo","atalho_negocio_central_turismo","abrev_negocio_central_turismo"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia turismo no polo comercial de central',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: CENTRAL - TURISMO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de central\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
