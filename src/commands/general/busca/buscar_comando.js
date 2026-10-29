/**
 * Busca & Navegação: buscar_comando
 */
module.exports = {
    name: 'buscar_comando',
    aliases: ["buscar"],
    category: 'general',
    subcategory: 'Busca & Descoberta',
    description: 'Pesquisa instantânea em todos os 10.000 comandos do bot por palavra-chave',
    cooldownMs: 2000,
    loreExempt: true,
    execute: async ({ reply, args, text, sender }) => {
        const { searchCommands } = require('../../../services/commandSearchService');
        const M = require('../../../utils/moldura');
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply('🔍 *Busca de Comandos (Índice de 10.000)*\n\nDigite o que deseja procurar.\nExemplo: `.buscar economia` ou `.buscar musica`');
        }
        const matches = searchCommands(query, 6);
        if (!matches.length) {
            return reply('😕 Nenhum comando encontrado para *"' + query + '"*. Tente palavras mais gerais.');
        }
        const lines = matches.map(m => `• .${m.name} (${m.category})\n  ↳ ${m.description || 'Sem descrição'}`);
        const doc = [
            M.cabecalho('🔍', 'Resultados da Busca: ' + query),
            lines.join('\n\n'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Command Index')
        ].join('\n\n');
        return reply(doc);
    }
};
