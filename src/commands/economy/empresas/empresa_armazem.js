const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_armazem',
    aliases: ["cmd_empresa_armazem","atalho_empresa_armazem","abrev_empresa_armazem"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Armazém Geral Aduaneiro',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: ARMAZÉM GERAL ADUANEIRO* ═══════╗\n\n'
        txt += '📖 *Descrição:* Galpões alfandegários para estocagem de especiarias e tecidos.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa armazem [Nome]`'
        return reply(txt.trim())
    }
}
