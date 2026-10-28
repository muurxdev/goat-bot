const companyService = require('../../../services/companyService')

module.exports = {
    name: 'negocio_vilarejo_mineracao',
    aliases: ["cmd_negocio_vilarejo_mineracao","atalho_negocio_vilarejo_mineracao","abrev_negocio_vilarejo_mineracao"],
    category: 'economy',
    subcategory: 'Franquias Regionais',
    description: 'Estudo de viabilidade de franquia mineracao no polo comercial de vilarejo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *FRANQUIA: VILAREJO - MINERACAO* ═══════╗\n\n'
        txt += '📍 *Polo Comercial:* Distrito Industrial de vilarejo\n'
        txt += '👥 *Demanda de Consumidores:* Alta frequência de aventureiros\n'
        txt += '💰 *Retorno Médio sobre o Capital:* 18% a 24% ao mês\n\n'
        txt += 'Para fundar uma empresa agora: `.fundarempresa`'
        return reply(txt.trim())
    }
}
