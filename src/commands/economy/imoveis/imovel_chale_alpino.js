const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'imovel_chale_alpino',
    aliases: ["cmd_imovel_chale_alpino","atalho_imovel_chale_alpino","abrev_imovel_chale_alpino"],
    category: 'economy',
    subcategory: 'Fichas Imobiliárias',
    description: 'Ficha técnica e potencial de rentabilidade de Chalé nas Montanhas de Reino',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA DO IMÓVEL: CHALÉ NAS MONTANHAS DE REINO* ═══════╗\n\n'
        txt += '🏷️ *Categoria:* Turismo\n'
        txt += '📍 *Localização:* Região Central de Reino\n\n'
        txt += '💡 *Benefícios de ser Proprietário deste Ativo:*\n'
        txt += '├ Rentabilidade passiva com recolhimento a cada 12 a 24 horas.\n'
        txt += '├ Proteção contra a desvalorização monetária.\n'
        txt += '└ Liquidez rápida: pode ser liquidado a qualquer momento no mercado imobiliário.\n\n'
        txt += 'Consulte todos os imóveis com `.imoveis`.'
        return reply(txt.trim())
    }
}
