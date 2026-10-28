const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_refinaria',
    aliases: ["cmd_empresa_refinaria","atalho_empresa_refinaria","abrev_empresa_refinaria"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Refinaria de Combustíveis',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: REFINARIA DE COMBUSTÍVEIS* ═══════╗\n\n'
        txt += '📖 *Descrição:* Destilação de óleos puros para lamparinas e maquinários a vapor.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa refinaria [Nome]`'
        return reply(txt.trim())
    }
}
