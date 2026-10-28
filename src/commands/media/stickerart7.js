/**
 * Comando .packperfis — PERFIS SALVOS
 *
 * Todas as identidades de pacote que você guardou.
 */

const S = require('../../services/stickerService')
const F = require('../../utils/formato')

module.exports = {
    name: 'packperfis',
    aliases: ["listarperfispack"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Lista os perfis de pacote de figurinha que você guardou',
    examples: [' — lista seus perfis salvos'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, prefix = '.' }) => {
    const todos = S.presets(sender)
    const chaves = Object.keys(todos)
    const atual = S.pacote(sender)
    if (!chaves.length) {
        return reply(F.tela({
            emoji: '🗂️',
            titulo: 'Perfis salvos',
            intro: 'Você ainda não salvou nenhum perfil.',
            secoes: [{
                emoji: '📋', titulo: 'O que é um perfil',
                linhas: ['Uma combinação de nome e autor guardada com um apelido. Serve para alternar entre pacotes (um do RPG, um dos memes...) com um comando só. Cabem até 10.']
            }, {
                emoji: '⌨️', titulo: 'Como criar',
                linhas: F.lista([
                    F.cmd(prefix, 'packnome', 'Pecados Capitais') + ' — define o nome',
                    F.cmd(prefix, 'packautor', 'SeuNome') + ' — define o autor',
                    F.cmd(prefix, 'packsalvar', 'rpg') + ' — guarda com o apelido rpg'
                ])
            }],
            prefix
        }))
    }
    const emUso = (p) => p.nome === atual.nome && p.autor === atual.autor
    return reply(F.tela({
        emoji: '🗂️',
        titulo: 'Perfis salvos',
        intro: `Você tem *${chaves.length} de 10* perfis.`,
        secoes: [{
            emoji: '📋', titulo: 'Perfis',
            linhas: F.lista(chaves.map(k => `*${k}* — ${todos[k].nome || '—'} / ${todos[k].autor || '—'}${emUso(todos[k]) ? ' ✅ em uso' : ''}`))
        }],
        proximos: [
            { nome: 'packusar', args: chaves[0], oque: 'trocar para um perfil' },
            { nome: 'packapagar', args: chaves[chaves.length - 1], oque: 'apagar um perfil' },
            chaves.length < 10 ? { nome: 'packsalvar', args: 'novo', oque: 'guardar o pacote atual' } : null
        ].filter(Boolean),
        prefix
    }))
    }
}
