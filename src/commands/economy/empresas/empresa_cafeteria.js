const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_cafeteria',
    aliases: ["cmd_empresa_cafeteria","atalho_empresa_cafeteria","abrev_empresa_cafeteria"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Cafeteria Encantada',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: CAFETERIA ENCANTADA* ═══════╗\n\n'
        txt += '📖 *Descrição:* Grãos torrados artesanais com infusões aromáticas e chantilly sagrado.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa cafeteria [Nome]`'
        return reply(txt.trim())
    }
}
