const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'imovel_palacete_nobre',
    aliases: ["cmd_imovel_palacete_nobre","atalho_imovel_palacete_nobre","abrev_imovel_palacete_nobre"],
    category: 'economy',
    subcategory: 'Fichas Imobiliárias',
    description: 'Ficha técnica e potencial de rentabilidade de Palacete Renascentista',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA DO IMÓVEL: PALACETE RENASCENTISTA* ═══════╗\n\n'
        txt += '🏷️ *Categoria:* Nobreza\n'
        txt += '📍 *Localização:* Região Central de Reino\n\n'
        txt += '💡 *Benefícios de ser Proprietário deste Ativo:*\n'
        txt += '├ Rentabilidade passiva com recolhimento a cada 12 a 24 horas.\n'
        txt += '├ Proteção contra a desvalorização monetária.\n'
        txt += '└ Liquidez rápida: pode ser liquidado a qualquer momento no mercado imobiliário.\n\n'
        txt += 'Consulte todos os imóveis com `.imoveis`.'
        return reply(txt.trim())
    }
}
