const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_mar_ocidental_mineracao',
    aliases: ["cmd_negocio_mar_ocidental_mineracao","atalho_negocio_mar_ocidental_mineracao","abrev_negocio_mar_ocidental_mineracao"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia mineracao no polo comercial de mar_ocidental',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: MAR_OCIDENTAL - MINERACAO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de mar_ocidental\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
