const securityService = require('../../services/securityService')
const F = require('../../utils/formato')

module.exports = {
    name: 'unban',
    aliases: ['desbanir', 'unblockuser'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Tira uma pessoa da minha lista de bloqueados',
    usage: '<@pessoa | número>',
    examples: [
        '@pessoa — libera a pessoa marcada',
        '5511999999999 — libera pelo número, com DDI e DDD'
    ],
    ownerOnly: true,
    execute: async ({ info, args, reply, prefix = '.' }) => {
        const target = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0]
        if (!target) {
            return reply(F.tela({
                emoji: '🔓',
                titulo: 'Liberar uma pessoa',
                intro: 'Diga quem devo tirar da lista de bloqueados: marque a pessoa ou mande o número.',
                secoes: [{
                    emoji: '✍️',
                    titulo: 'Digite assim',
                    linhas: [
                        `• ${F.cmd(prefix, 'unban', '@pessoa')}`,
                        `• ${F.cmd(prefix, 'unban', '5511999999999')}`
                    ]
                }],
                proximos: [{ nome: 'blacklist', oque: 'vê quem está bloqueado' }],
                prefix
            }))
        }

        const cleanJid = target.includes('@') ? target : `${target}@s.whatsapp.net`
        const numero = cleanJid.split('@')[0].split(':')[0]

        securityService.unbanUser(cleanJid)
        await reply(F.tela({
            emoji: '✅',
            titulo: 'Pessoa liberada',
            intro: `@${numero} saiu da lista de bloqueados e já pode usar meus comandos de novo.`,
            proximos: [{ nome: 'blacklist', oque: 'confere a lista atualizada' }],
            prefix
        }), [cleanJid])
    }
}
