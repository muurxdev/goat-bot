const F = require('../../utils/formato')

module.exports = {
    name: 'meuid',
    aliases: ['myid', 'jid'],
    category: 'general',
    subcategory: 'Informação',
    description: 'Mostra o seu código no WhatsApp ou o de quem você marcar',
    usage: '[@pessoa]',
    examples: [' — o seu código', '@pessoa — o código de outra pessoa'],
    execute: async ({ info, sender, reply, mentionedJid, prefix = '.' }) => {
        const marcado = (Array.isArray(mentionedJid) ? mentionedJid[0] : mentionedJid)
            || info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const alvoId = marcado || sender
        const numero = String(alvoId).split('@')[0].split(':')[0]
        const ehLid = String(alvoId).endsWith('@lid')
        await reply(F.tela({
            emoji: '🆔',
            titulo: marcado ? 'Código da pessoa' : 'Seu código',
            intro: '`' + alvoId + '`',
            secoes: [{ emoji: '📋', titulo: 'Detalhes', linhas: [
                F.campo('Pessoa', '@' + numero),
                F.campo('Tipo', ehLid ? 'código privado (o WhatsApp esconde o número)' : 'número de telefone')
            ] }],
            dica: 'Meus donos usam esse código para dar cargos ou liberar recursos para alguém.',
            proximos: [
                { nome: 'id', oque: 'ver o código desta conversa' },
                { nome: 'meuid', args: '@pessoa', oque: 'ver o código de outra pessoa' }
            ],
            prefix
        }), [alvoId])
    }
}
