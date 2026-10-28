const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_software',
    aliases: ["cmd_empresa_software","atalho_empresa_software","abrev_empresa_software"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Desenvolvimento Tecnológico',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: DESENVOLVIMENTO TECNOLÓGICO* ═══════╗\n\n'
        txt += '📖 *Descrição:* Automação de processos empresariais e inteligência analítica.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa software [Nome]`'
        return reply(txt.trim())
    }
}
