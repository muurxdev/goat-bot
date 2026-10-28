const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_purgatorio_segurança',
    aliases: ["cmd_negocio_purgatorio_segurança","atalho_negocio_purgatorio_segurança","abrev_negocio_purgatorio_segurança"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia segurança no polo comercial de purgatorio',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: PURGATORIO - SEGURANÇA* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de purgatorio\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
