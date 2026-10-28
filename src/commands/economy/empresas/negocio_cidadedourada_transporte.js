const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_cidadedourada_transporte',
    aliases: ["cmd_negocio_cidadedourada_transporte","atalho_negocio_cidadedourada_transporte","abrev_negocio_cidadedourada_transporte"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia transporte no polo comercial de cidade dourada',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: CIDADE DOURADA - TRANSPORTE* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de cidade dourada\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
