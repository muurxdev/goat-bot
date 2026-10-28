const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_forja',
    aliases: ["cmd_empresa_forja","atalho_empresa_forja","abrev_empresa_forja"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Forja dos Cavaleiros',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: FORJA DOS CAVALEIROS* ═══════╗\n\n'
        txt += '📖 *Descrição:* Fabricação de escudos encantados, cotas de malha e lâminas afiadas.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa forja [Nome]`'
        return reply(txt.trim())
    }
}
