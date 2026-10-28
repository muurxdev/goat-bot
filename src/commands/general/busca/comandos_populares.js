/**
 * Busca & Navegação: comandos_populares
 */
module.exports = {
    name: 'comandos_populares',
    aliases: ["mais_usados"],
    category: 'general',
    subcategory: 'Busca & Descoberta',
    description: 'Exibe a lista dos comandos mais executados pela comunidade',
    cooldownMs: 2000,
    loreExempt: true,
    execute: async ({ reply, args, text, sender }) => {
        const M = require('../../../utils/moldura');
        const top = ['.menu', '.ia', '.perfil', '.saldo', '.daily', '.play', '.fig', '.bolsa_carteira', '.quiz', '.forjar_item'];
        const doc = [
            M.cabecalho('🔥', 'Comandos Mais Populares'),
            top.map((c, i) => `${i + 1}º • ${c}`).join('\n'),
            M.assinatura('GOATBOT')
        ].join('\n\n');
        return reply(doc);
    }
};
