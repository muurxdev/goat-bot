const { nomeDoMembro } = require('../../utils/nomeMembro');
const securityService = require('../../services/securityService')
const F = require('../../utils/formato')

module.exports = {
    name: 'banglobal',
    aliases: ['blockuser', 'ban-global', 'banirglobal'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Bloqueia uma pessoa de usar meus comandos em todos os grupos e no privado',
    usage: '<@pessoa | número> [motivo]',
    examples: [
        '@pessoa spam de comandos — bloqueia com motivo',
        '5511999999999 — bloqueia pelo número (motivo padrão)'
    ],
    ownerOnly: true,
    execute: async ({ info, args, sender, reply, prefix = '.' }) => {
        const target = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0]
        if (!target) {
            return reply(F.tela({
                emoji: '🚫',
                titulo: 'Bloquear uma pessoa',
                intro: 'Quem entra na lista de bloqueados não consegue usar meus comandos em lugar nenhum. Diga quem é e, se quiser, o motivo.',
                secoes: [{
                    emoji: '✍️',
                    titulo: 'Digite assim',
                    linhas: [
                        `• ${F.cmd(prefix, 'banglobal', '@pessoa motivo')}`,
                        `• ${F.cmd(prefix, 'banglobal', '5511999999999 flood')}`
                    ]
                }],
                dica: `Para só tirar alguém deste grupo, use ${F.cmd(prefix, 'ban', '@pessoa')}.`,
                proximos: [{ nome: 'blacklist', oque: 'vê quem já está bloqueado' }],
                prefix
            }))
        }

        const cleanJid = target.includes('@') ? target : `${target}@s.whatsapp.net`
        const motivo = args.slice(1).join(' ') || 'Violação das regras'
        const numero = cleanJid.split('@')[0].split(':')[0]

        securityService.banUser(cleanJid, motivo, sender)
        await reply(F.tela({
            emoji: '🚫',
            titulo: 'Pessoa bloqueada',
            intro: `A partir de agora não atendo mais @${numero} em nenhum grupo nem no privado.`,
            secoes: [{
                emoji: '📋',
                titulo: 'Registro',
                linhas: [
                    F.campo('Motivo', motivo),
                    F.campo('Bloqueado por', `${nomeDoMembro(sender)}`)
                ]
            }],
            proximos: [
                { nome: 'unban', args: '@pessoa', oque: 'desfaz o bloqueio' },
                { nome: 'blacklist', oque: 'vê a lista completa' }
            ],
            prefix
        }), [sender, cleanJid])
    }
}
