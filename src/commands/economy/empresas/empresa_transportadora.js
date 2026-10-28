const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_transportadora',
    aliases: ["cmd_empresa_transportadora","atalho_empresa_transportadora","abrev_empresa_transportadora"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Logística de Carruagens',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: LOGÍSTICA DE CARRUAGENS* ═══════╗\n\n'
        txt += '📖 *Descrição:* Controle de frotas mercantes, comboios armados e fretes intermunicipais.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa transportadora [Nome]`'
        return reply(txt.trim())
    }
}
