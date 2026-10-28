const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_telecom',
    aliases: ["cmd_empresa_telecom","atalho_empresa_telecom","abrev_empresa_telecom"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Rede de Torres Arcanas',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: REDE DE TORRES ARCANAS* ═══════╗\n\n'
        txt += '📖 *Descrição:* Torres transmissoras de sinais telepáticos e de fumaça mágica.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa telecom [Nome]`'
        return reply(txt.trim())
    }
}
