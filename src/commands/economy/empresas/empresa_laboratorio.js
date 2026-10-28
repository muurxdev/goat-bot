const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_laboratorio',
    aliases: ["cmd_empresa_laboratorio","atalho_empresa_laboratorio","abrev_empresa_laboratorio"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Alquimia & Poções',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: ALQUIMIA & POÇÕES* ═══════╗\n\n'
        txt += '📖 *Descrição:* Destilação de elixires de regeneração e catalisadores mágicos.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa laboratorio [Nome]`'
        return reply(txt.trim())
    }
}
