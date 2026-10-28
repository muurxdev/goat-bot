const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'imovel_fazenda',
    aliases: ["cmd_imovel_fazenda","atalho_imovel_fazenda","abrev_imovel_fazenda"],
    category: 'economy',
    subcategory: 'Fichas Imobiliárias',
    description: 'Ficha técnica e potencial de rentabilidade de Fazenda do Vale Verde',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA DO IMÓVEL: FAZENDA DO VALE VERDE* ═══════╗\n\n'
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
