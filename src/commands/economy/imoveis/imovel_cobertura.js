const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'imovel_cobertura',
    aliases: ["cmd_imovel_cobertura","atalho_imovel_cobertura","abrev_imovel_cobertura"],
    category: 'economy',
    subcategory: 'Fichas Imobiliárias',
    description: 'Ficha técnica e potencial de rentabilidade de Cobertura Duplex Real',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA DO IMÓVEL: COBERTURA DUPLEX REAL* ═══════╗\n\n'
        txt += '🏷️ *Categoria:* Luxo Real\n'
        txt += '📍 *Localização:* Região Central de Reino\n\n'
        txt += '💡 *Benefícios de ser Proprietário deste Ativo:*\n'
        txt += '├ Rentabilidade passiva com recolhimento a cada 12 a 24 horas.\n'
        txt += '├ Proteção contra a desvalorização monetária.\n'
        txt += '└ Liquidez rápida: pode ser liquidado a qualquer momento no mercado imobiliário.\n\n'
        txt += 'Consulte todos os imóveis com `.imoveis`.'
        return reply(txt.trim())
    }
}
