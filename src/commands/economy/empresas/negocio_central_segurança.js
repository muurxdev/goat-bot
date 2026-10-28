const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_central_segurança',
    aliases: ["cmd_negocio_central_segurança","atalho_negocio_central_segurança","abrev_negocio_central_segurança"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia segurança no polo comercial de central',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: CENTRAL - SEGURANÇA* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de central\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
