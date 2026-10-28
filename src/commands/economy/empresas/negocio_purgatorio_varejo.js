const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_purgatorio_varejo',
    aliases: ["cmd_negocio_purgatorio_varejo","atalho_negocio_purgatorio_varejo","abrev_negocio_purgatorio_varejo"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia varejo no polo comercial de purgatorio',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: PURGATORIO - VAREJO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de purgatorio\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
