const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_hotelaria',
    aliases: ["cmd_empresa_hotelaria","atalho_empresa_hotelaria","abrev_empresa_hotelaria"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Resort & Termas Reais',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: RESORT & TERMAS REAIS* ═══════╗\n\n'
        txt += '📖 *Descrição:* Piscinas termais com águas sulfurosas para descanso dos heróis.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa hotelaria [Nome]`'
        return reply(txt.trim())
    }
}
