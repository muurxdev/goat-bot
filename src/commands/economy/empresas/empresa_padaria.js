const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_padaria',
    aliases: ["cmd_empresa_padaria","atalho_empresa_padaria","abrev_empresa_padaria"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Padaria Imperial',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: PADARIA IMPERIAL* ═══════╗\n\n'
        txt += '📖 *Descrição:* Produção em larga escala de pães especiais, brioches e trigo moído.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa padaria [Nome]`'
        return reply(txt.trim())
    }
}
