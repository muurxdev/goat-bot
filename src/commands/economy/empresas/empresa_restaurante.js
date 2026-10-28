const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_restaurante',
    aliases: ["cmd_empresa_restaurante","atalho_empresa_restaurante","abrev_empresa_restaurante"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Restaurante Cinco Estrelas',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: RESTAURANTE CINCO ESTRELAS* ═══════╗\n\n'
        txt += '📖 *Descrição:* Culinária gourmet servida para duques, reis e grandes líderes.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa restaurante [Nome]`'
        return reply(txt.trim())
    }
}
