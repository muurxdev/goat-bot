const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_estudio',
    aliases: ["cmd_empresa_estudio","atalho_empresa_estudio","abrev_empresa_estudio"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Entretenimento & Jogos',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: ENTRETENIMENTO & JOGOS* ═══════╗\n\n'
        txt += '📖 *Descrição:* Desenvolvimento de jogos de cartas colecionáveis e festivais reais.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa estudio [Nome]`'
        return reply(txt.trim())
    }
}
