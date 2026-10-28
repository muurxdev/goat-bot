/**
 * Busca & Navegação: catalogo_comandos
 */
module.exports = {
    name: 'catalogo_comandos',
    aliases: ["total_comandos","painel_10k"],
    category: 'general',
    subcategory: 'Busca & Descoberta',
    description: 'Exibe o totalizador oficial e estatísticas dos 10.000 comandos canônicos do bot',
    cooldownMs: 2000,
    loreExempt: true,
    execute: async ({ reply, args, text, sender }) => {
        const { getCatalogStats } = require('../../../services/commandSearchService');
        const M = require('../../../utils/moldura');
        const stats = getCatalogStats();
        const catLines = Object.entries(stats.byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, qtd]) => `• *${cat.toUpperCase()}*: ${qtd} comandos`);
        const doc = [
            M.cabecalho('⚡', 'Catálogo Oficial de 10.000 Comandos'),
            '👑 *GOATBOT 100% Completo!*',
            '📦 *Módulos Canônicos:* ' + stats.totalCommands + ' arquivos\n' +
            '🏷️ *Aliases Mapeados:* ' + stats.totalAliases + '\n' +
            '🎯 *Gatilhos Invocáveis:* ' + stats.totalTriggers + ' comandos prontos!',
            M.secao('📊', 'Comandos por Categoria', catLines),
            M.assinatura('GOAT Prime Architecture')
        ].join('\n\n');
        return reply(doc);
    }
};
