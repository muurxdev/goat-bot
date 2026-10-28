const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_banco',
    aliases: ["cmd_empresa_banco","atalho_empresa_banco","abrev_empresa_banco"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Casa Bancária Nobre',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: CASA BANCÁRIA NOBRE* ═══════╗\n\n'
        txt += '📖 *Descrição:* Gestão de caixas fortes, cofres blindados e custódia de moedas.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa banco [Nome]`'
        return reply(txt.trim())
    }
}
