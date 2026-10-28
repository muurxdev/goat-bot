const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_armaria',
    aliases: ["cmd_empresa_armaria","atalho_empresa_armaria","abrev_empresa_armaria"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Arsenal de Guerra',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: ARSENAL DE GUERRA* ═══════╗\n\n'
        txt += '📖 *Descrição:* Arco longo, flechas perfurantes, lanças e catapultas de cerco.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa armaria [Nome]`'
        return reply(txt.trim())
    }
}
