const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_central_construcao',
    aliases: ["cmd_negocio_central_construcao","atalho_negocio_central_construcao","abrev_negocio_central_construcao"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia construcao no polo comercial de central',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: CENTRAL - CONSTRUCAO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de central\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
