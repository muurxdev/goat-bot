const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_cidadedourada_segurança',
    aliases: ["cmd_negocio_cidadedourada_segurança","atalho_negocio_cidadedourada_segurança","abrev_negocio_cidadedourada_segurança"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia segurança no polo comercial de cidadedourada',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: CIDADEDOURADA - SEGURANÇA* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de cidadedourada\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
