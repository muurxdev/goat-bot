const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_leiloes',
    aliases: ["cmd_empresa_leiloes","atalho_empresa_leiloes","abrev_empresa_leiloes"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Casa de Leilões de Raridades',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: CASA DE LEILÕES DE RARIDADES* ═══════╗\n\n'
        txt += '📖 *Descrição:* Martelo oficial de obras de arte, relíquias sagradas e antiguidades.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa leiloes [Nome]`'
        return reply(txt.trim())
    }
}
