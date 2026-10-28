const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_cervejaria',
    aliases: ["cmd_empresa_cervejaria","atalho_empresa_cervejaria","abrev_empresa_cervejaria"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Cervejaria do Dragão',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: CERVEJARIA DO DRAGÃO* ═══════╗\n\n'
        txt += '📖 *Descrição:* Brassagem de cervejas artesanais de alta fermentação e lúpulo nobre.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa cervejaria [Nome]`'
        return reply(txt.trim())
    }
}
