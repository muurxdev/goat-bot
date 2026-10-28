/**
 * Busca & Navegação: sugestao_comando
 * Recomenda comandos assertivos e de alto impacto para a intenção do usuário
 */

const { suggestByIntent } = require('../../../services/smartRecommendationService');
const M = require('../../../utils/moldura');

module.exports = {
    name: 'sugestao_comando',
    aliases: ["sugestao","o_que_fazer"],
    category: 'general',
    subcategory: 'Busca & Descoberta',
    description: 'Sugere os melhores comandos do bot de acordo com o que você quer fazer',
    cooldownMs: 2000,
    loreExempt: true,
    execute: async ({ reply, args, text, prefix = '.' }) => {
        const query = (text || args.join(' ')).trim();
        const res = suggestByIntent(query);

        const linhasComandos = res.commands.map(c => 
            `• \`${prefix}${c.cmd}\` — ${c.desc}`
        );

        const blocos = [
            M.cabecalho('💡', `RECOMENDAÇÃO: ${res.topic.toUpperCase()}`),
            M.secao('🎯', 'Comandos mais Indicados', linhasComandos),
            `💡 _Dica: Digite \`${prefix}menu\` para explorar todas as categorias ou \`${prefix}buscar <termo>\` para encontrar recursos específicos._`,
            M.assinatura()
        ];

        return reply(blocos.join('\n\n'));
    }
};
