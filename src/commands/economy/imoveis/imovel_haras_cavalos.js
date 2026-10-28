const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'imovel_haras_cavalos',
    aliases: ["cmd_imovel_haras_cavalos","atalho_imovel_haras_cavalos","abrev_imovel_haras_cavalos"],
    category: 'economy',
    subcategory: 'Fichas Imobiliárias',
    description: 'Ficha técnica e potencial de rentabilidade de Haras Imperial de Cavalos Alados',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA DO IMÓVEL: HARAS IMPERIAL DE CAVALOS ALADOS* ═══════╗\n\n'
        txt += '🏷️ *Categoria:* Criação\n'
        txt += '📍 *Localização:* Região Central de Reino\n\n'
        txt += '💡 *Benefícios de ser Proprietário deste Ativo:*\n'
        txt += '├ Rentabilidade passiva com recolhimento a cada 12 a 24 horas.\n'
        txt += '├ Proteção contra a desvalorização monetária.\n'
        txt += '└ Liquidez rápida: pode ser liquidado a qualquer momento no mercado imobiliário.\n\n'
        txt += 'Consulte todos os imóveis com `.imoveis`.'
        return reply(txt.trim())
    }
}
