const F = require('../../utils/formato')

module.exports = {
    name: 'id',
    aliases: ['chatid'],
    category: 'general',
    subcategory: 'Informação',
    description: 'Mostra o código desta conversa, usado em configurações',
    examples: [' — mostra o código do grupo ou da conversa atual'],
    execute: async ({ from, reply, isGroup, prefix = '.' }) => {
        const grupo = isGroup ?? String(from).endsWith('@g.us')
        await reply(F.tela({
            emoji: '🆔',
            titulo: grupo ? 'Código deste grupo' : 'Código desta conversa',
            intro: '`' + from + '`',
            secoes: [{ emoji: '📌', titulo: 'Para que serve', linhas: [
                'É o endereço interno que o WhatsApp usa para esta conversa. Meus donos pedem esse código para liberar ou configurar um grupo.'
            ] }],
            dica: 'Segure a mensagem acima para copiar só o código.',
            proximos: [
                { nome: 'meuid', oque: 'ver o seu próprio código' },
                grupo ? { nome: 'meusgrupos', oque: 'ver os grupos em que estamos juntos' } : null
            ].filter(Boolean),
            prefix
        }))
    }
}
