const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_mar_ocidental_magia',
    aliases: ["cmd_negocio_mar_ocidental_magia","atalho_negocio_mar_ocidental_magia","abrev_negocio_mar_ocidental_magia"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia magia no polo comercial de mar_ocidental',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: MAR_OCIDENTAL - MAGIA* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de mar_ocidental\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
