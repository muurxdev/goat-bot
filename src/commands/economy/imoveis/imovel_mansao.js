const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'imovel_mansao',
    aliases: ["cmd_imovel_mansao","atalho_imovel_mansao","abrev_imovel_mansao"],
    category: 'economy',
    subcategory: 'Fichas Imobiliárias',
    description: 'Ficha técnica e potencial de rentabilidade de Mansão dos Cavaleiros',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA DO IMÓVEL: MANSÃO DOS CAVALEIROS* ═══════╗\n\n'
        txt += '🏷️ *Categoria:* Alto Padrão\n'
        txt += '📍 *Localização:* Região Central de Reino\n\n'
        txt += '💡 *Benefícios de ser Proprietário deste Ativo:*\n'
        txt += '├ Rentabilidade passiva com recolhimento a cada 12 a 24 horas.\n'
        txt += '├ Proteção contra a desvalorização monetária.\n'
        txt += '└ Liquidez rápida: pode ser liquidado a qualquer momento no mercado imobiliário.\n\n'
        txt += 'Consulte todos os imóveis com `.imoveis`.'
        return reply(txt.trim())
    }
}
