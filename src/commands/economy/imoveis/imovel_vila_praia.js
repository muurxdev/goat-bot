const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'imovel_vila_praia',
    aliases: ["cmd_imovel_vila_praia","atalho_imovel_vila_praia","abrev_imovel_vila_praia"],
    category: 'economy',
    subcategory: 'Fichas Imobiliárias',
    description: 'Ficha técnica e potencial de rentabilidade de Vila à Beira-Mar',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA DO IMÓVEL: VILA À BEIRA-MAR* ═══════╗\n\n'
        txt += '🏷️ *Categoria:* Litoral\n'
        txt += '📍 *Localização:* Região Central de Reino\n\n'
        txt += '💡 *Benefícios de ser Proprietário deste Ativo:*\n'
        txt += '├ Rentabilidade passiva com recolhimento a cada 12 a 24 horas.\n'
        txt += '├ Proteção contra a desvalorização monetária.\n'
        txt += '└ Liquidez rápida: pode ser liquidado a qualquer momento no mercado imobiliário.\n\n'
        txt += 'Consulte todos os imóveis com `.imoveis`.'
        return reply(txt.trim())
    }
}
