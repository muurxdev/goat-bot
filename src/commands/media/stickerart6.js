/**
 * Comando .packusar — USAR PERFIL
 *
 * Troca para uma identidade salva.
 */

const S = require('../../services/stickerService')
const F = require('../../utils/formato')

module.exports = {
    name: 'packusar',
    aliases: ["trocarperfilpack"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Troca o pacote das suas figurinhas para um perfil salvo',
    usage: '<apelido>',
    examples: [' — lista seus perfis', 'rpg — passa a usar o perfil rpg'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const apelido = String(args[0] || '').trim()
    const todos = S.presets(sender)
    const nomes = Object.keys(todos)
    if (!apelido) {
        if (!nomes.length) {
            return reply(F.tela({
                emoji: '🔄',
                titulo: 'Usar perfil',
                intro: 'Você ainda não tem perfis salvos. Um perfil guarda nome e autor para trocar de pacote com um comando só.',
                secoes: [{
                    emoji: '📋', titulo: 'Como criar um',
                    linhas: F.lista([
                        F.cmd(prefix, 'packnome', 'Pecados Capitais'),
                        F.cmd(prefix, 'packautor', 'SeuNome'),
                        F.cmd(prefix, 'packsalvar', 'rpg') + ' — guarda com o apelido rpg'
                    ])
                }],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '🔄',
            titulo: 'Usar perfil',
            intro: 'Escolha um dos seus perfis pelo apelido.',
            secoes: [
                { emoji: '🗂️', titulo: 'Seus perfis', linhas: F.lista(nomes.map(k => `*${k}* — ${todos[k].nome || '—'} / ${todos[k].autor || '—'}`)) },
                { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'packusar', nomes[0])] }
            ],
            prefix
        }))
    }
    const r = S.usarPreset(sender, apelido)
    if (!r.ok) {
        return reply(F.tela({
            emoji: '🔄',
            titulo: 'Perfil não encontrado',
            intro: `Não tenho nenhum perfil com o apelido *${apelido}*.`,
            secoes: [nomes.length ? { emoji: '🗂️', titulo: 'Seus perfis', linhas: [nomes.join(', ')] } : null],
            proximos: [nomes.length ? { nome: 'packusar', args: nomes[0], oque: 'usar um perfil existente' } : { nome: 'packsalvar', args: apelido.toLowerCase(), oque: 'criar esse perfil' }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🔄',
        titulo: `Usando o perfil ${apelido.toLowerCase()}`,
        intro: 'Suas próximas figurinhas saem com esta identidade.',
        secoes: [{ emoji: '📋', titulo: 'Pacote', linhas: [F.campo('Nome', r.preset.nome || 'padrão'), F.campo('Autor', r.preset.autor || 'padrão')] }],
        proximos: [
            { nome: 'fig', oque: 'responda a uma imagem para criar a figurinha' },
            { nome: 'packperfis', oque: 'ver todos os perfis' }
        ],
        prefix
    }))
    }
}
