const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'imovel_vinhedo_real',
    aliases: ["cmd_imovel_vinhedo_real","atalho_imovel_vinhedo_real","abrev_imovel_vinhedo_real"],
    category: 'economy',
    subcategory: 'Fichas Imobiliárias',
    description: 'Ficha técnica e potencial de rentabilidade de Vinhedo das Fadas',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA DO IMÓVEL: VINHEDO DAS FADAS* ═══════╗\n\n'
        txt += '🏷️ *Categoria:* Produção Vinícola\n'
        txt += '📍 *Localização:* Região Central de Reino\n\n'
        txt += '💡 *Benefícios de ser Proprietário deste Ativo:*\n'
        txt += '├ Rentabilidade passiva com recolhimento a cada 12 a 24 horas.\n'
        txt += '├ Proteção contra a desvalorização monetária.\n'
        txt += '└ Liquidez rápida: pode ser liquidado a qualquer momento no mercado imobiliário.\n\n'
        txt += 'Consulte todos os imóveis com `.imoveis`.'
        return reply(txt.trim())
    }
}
