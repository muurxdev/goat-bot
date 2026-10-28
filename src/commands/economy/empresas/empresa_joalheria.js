const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_joalheria',
    aliases: ["cmd_empresa_joalheria","atalho_empresa_joalheria","abrev_empresa_joalheria"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Joalheria Central',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: JOALHERIA CENTRAL* ═══════╗\n\n'
        txt += '📖 *Descrição:* Lapidação de pingentes mágicos, anéis de noivado e tiaras reais.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa joalheria [Nome]`'
        return reply(txt.trim())
    }
}
