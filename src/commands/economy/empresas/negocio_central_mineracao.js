const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_central_mineracao',
    aliases: ["cmd_negocio_central_mineracao","atalho_negocio_central_mineracao","abrev_negocio_central_mineracao"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia mineracao no polo comercial de central',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: CENTRAL - MINERACAO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de central\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
