const companyService = require('../../../services/companyService')

module.exports = {
    name: 'empresa_serraria',
    aliases: ["cmd_empresa_serraria","atalho_empresa_serraria","abrev_empresa_serraria"],
    category: 'economy',
    subcategory: 'Setores Empresariais',
    description: 'Guia de investimento e oportunidades no setor de Serraria Florestal',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏢 *SETOR: SERRARIA FLORESTAL* ═══════╗\n\n'
        txt += '📖 *Descrição:* Corte sustentável de madeiras nobres para embarcações e catedrais.\n\n'
        txt += '💡 *Dicas de Gestão para este Setor:*\n'
        txt += '├ 1. Contrate pelo menos 3 funcionários no início para cobrir os custos fixos.\n'
        txt += '├ 2. Invista em Marketing (`.marketingempresa`) para aumentar sua margem líquida.\n'
        txt += '├ 3. Suba o nível da empresa (`.upgradeempresa`) para liberar vagas extras.\n'
        txt += '└ 4. Recolha seus lucros diariamente (`.coletarlucro`).\n\n'
        txt += '🏢 Para abrir sua empresa neste ramo: `.fundarempresa serraria [Nome]`'
        return reply(txt.trim())
    }
}
