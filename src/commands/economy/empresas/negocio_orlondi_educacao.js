const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_orlondi_educacao',
    aliases: ["cmd_negocio_orlondi_educacao","atalho_negocio_orlondi_educacao","abrev_negocio_orlondi_educacao"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia educacao no polo comercial de orlondi',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: ORLONDI - EDUCACAO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de orlondi\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
