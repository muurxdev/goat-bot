const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_oficina',
    aliases: ["cmd_empresa_oficina","atalho_empresa_oficina","abrev_empresa_oficina"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Oficina Mecânica Britânica',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: OFICINA MECÂNICA BRITÂNICA* ═══════╗\n\n'
        txt += '📖 *Descrição:* Reparo de eixos de carruagens, engrenagens e armaduras danificadas.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa oficina [Nome]`'
        return reply(txt.trim())
    }
}
