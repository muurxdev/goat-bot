const securityService = require('../../services/securityService')
const F = require('../../utils/formato')

/** Número legível a partir do identificador do WhatsApp. */
function numeroDe(jid) {
    return String(jid || '').split('@')[0].split(':')[0]
}

module.exports = {
    name: 'blacklist',
    aliases: [],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Mostra quem está bloqueado de usar meus comandos em qualquer lugar',
    examples: [' — lista as pessoas bloqueadas, com motivo e data'],
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
        const bans = securityService.getBannedUsers()
        if (bans.length === 0) {
            return reply(F.tela({
                emoji: '🛡️',
                titulo: 'Ninguém bloqueado',
                intro: 'Minha lista de bloqueados está vazia: todo mundo pode usar meus comandos.',
                secoes: [{
                    emoji: '📋',
                    titulo: 'O que aparece aqui',
                    linhas: ['Cada pessoa bloqueada com o número, o motivo e a data do bloqueio.']
                }],
                dica: `Para bloquear alguém em todos os grupos e no privado, use ${F.cmd(prefix, 'banglobal', '@pessoa motivo')}.`,
                proximos: [
                    { nome: 'banglobal', args: '@pessoa motivo', oque: 'bloqueia alguém de usar meus comandos' },
                    { nome: 'unban', args: '@pessoa', oque: 'libera alguém bloqueado' }
                ],
                prefix
            }))
        }

        const mostrados = bans.slice(0, 30)
        const linhas = []
        mostrados.forEach((b, i) => {
            linhas.push(`*${i + 1}.* @${numeroDe(b.jid)}`)
            linhas.push(`   ${F.campo('Motivo', b.motivo)}`)
            linhas.push(`   ${F.campo('Data', b.created_at)}`)
        })
        if (bans.length > mostrados.length) linhas.push(`_…e mais ${bans.length - mostrados.length}._`)

        await reply(F.tela({
            emoji: '🚫',
            titulo: `Bloqueados: ${bans.length}`,
            intro: `${bans.length === 1 ? 'Esta pessoa não pode' : 'Estas pessoas não podem'} usar meus comandos em lugar nenhum.`,
            secoes: [{ emoji: '📋', titulo: 'Lista de bloqueados', linhas }],
            proximos: [
                { nome: 'unban', args: '@pessoa', oque: 'libera alguém da lista' },
                { nome: 'banglobal', args: '@pessoa motivo', oque: 'bloqueia mais alguém' }
            ],
            prefix
        }), mostrados.map(b => b.jid))
    }
}
