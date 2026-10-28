const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_orlondi_banco',
    aliases: ["cmd_negocio_orlondi_banco","atalho_negocio_orlondi_banco","abrev_negocio_orlondi_banco"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia banco no polo comercial de orlondi',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: ORLONDI - BANCO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de orlondi\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
