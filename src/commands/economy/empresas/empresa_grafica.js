const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_grafica',
    aliases: ["cmd_empresa_grafica","atalho_empresa_grafica","abrev_empresa_grafica"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Imprensa & Panfletos',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: IMPRENSA & PANFLETOS* ═══════╗\n\n'
        txt += '📖 *Descrição:* Tipografia mecânica com tiragens de jornais e cartazes de procurado.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa grafica [Nome]`'
        return reply(txt.trim())
    }
}
