const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_cidadedourada_educacao',
    aliases: ["cmd_negocio_cidadedourada_educacao","atalho_negocio_cidadedourada_educacao","abrev_negocio_cidadedourada_educacao"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia educacao no polo comercial de cidade dourada',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: CIDADE DOURADA - EDUCACAO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de cidade dourada\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
