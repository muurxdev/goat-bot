const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'imovel_sitio_araucarias',
    aliases: ["cmd_imovel_sitio_araucarias","atalho_imovel_sitio_araucarias","abrev_imovel_sitio_araucarias"],
    category: 'economy',
    subcategory: 'Fichas Imobiliárias',
    description: 'Ficha técnica e potencial de rentabilidade de Sítio das Araucárias',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA DO IMÓVEL: SÍTIO DAS ARAUCÁRIAS* ═══════╗\n\n'
        txt += '🏷️ *Categoria:* Rural\n'
        txt += '📍 *Localização:* Região Central de Reino\n\n'
        txt += '💡 *Benefícios de ser Proprietário deste Ativo:*\n'
        txt += '├ Rentabilidade passiva com recolhimento a cada 12 a 24 horas.\n'
        txt += '├ Proteção contra a desvalorização monetária.\n'
        txt += '└ Liquidez rápida: pode ser liquidado a qualquer momento no mercado imobiliário.\n\n'
        txt += 'Consulte todos os imóveis com `.imoveis`.'
        return reply(txt.trim())
    }
}
