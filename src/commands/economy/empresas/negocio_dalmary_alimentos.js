const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_dalmary_alimentos',
    aliases: ["cmd_negocio_dalmary_alimentos","atalho_negocio_dalmary_alimentos","abrev_negocio_dalmary_alimentos"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia alimentos no polo comercial de dalmary',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: DALMARY - ALIMENTOS* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de dalmary\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
