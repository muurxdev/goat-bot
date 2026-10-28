const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_seguranca',
    aliases: ["cmd_empresa_seguranca","atalho_empresa_seguranca","abrev_empresa_seguranca"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Guarda Patrimonial',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: GUARDA PATRIMONIAL* ═══════╗\n\n'
        txt += '📖 *Descrição:* Contratação de sentinelas de elite e patrulhas noturnas.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa seguranca [Nome]`'
        return reply(txt.trim())
    }
}
