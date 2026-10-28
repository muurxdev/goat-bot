const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_sorveteria',
    aliases: ["cmd_empresa_sorveteria","atalho_empresa_sorveteria","abrev_empresa_sorveteria"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Sorveteria das Geleiras',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: SORVETERIA DAS GELEIRAS* ═══════╗\n\n'
        txt += '📖 *Descrição:* Sorvetes artesanais mantidos com cristais perpétuos de gelo.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa sorveteria [Nome]`'
        return reply(txt.trim())
    }
}
