/**
 * Comando .socialconexoes — SUAS CONEXÕES
 *
 * Todo mundo com quem você já trocou gestos.
 */

const S = require('../../services/socialService')
const F = require('../../utils/formato')

module.exports = {
    name: 'socialconexoes',
    aliases: ["minhasconexoes"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Todo mundo com quem você já trocou gestos',
    examples: [" — lista todas as pessoas com quem você já trocou gestos"],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os vínculos sociais são contados por grupo. Use este comando dentro de um grupo.')
    const c = S.conexoesDe(from, sender, 15)
    if (!c.length) {
        return reply(F.tela({
            emoji: '🕸️', titulo: 'Suas conexões',
            intro: 'Nenhuma conexão ainda: você não trocou gestos com ninguém neste grupo.',
            secoes: [{ emoji: '📜', titulo: 'O que aparece aqui', linhas: [
                'Até 15 pessoas com quem você trocou gestos, com o nível de cada vínculo.'
            ] }],
            dica: 'Um gesto já cria a conexão. Experimente ' + F.cmd(prefix, 'brindar', '@pessoa') + '.',
            proximos: [
                { nome: 'brindar', args: '@pessoa', oque: 'criar sua primeira conexão' },
                { nome: 'socialcatalogo', oque: 'ver todos os gestos' }
            ],
            prefix
        }), [sender])
    }
    const mencoes = [sender, ...c.map(x => x.outro)]
    return reply(F.tela({
        emoji: '🕸️', titulo: 'Suas conexões',
        intro: 'Você tem vínculo com ' + c.length + (c.length === 1 ? ' pessoa' : ' pessoas') + ' neste grupo.',
        secoes: [{ emoji: '🤝', titulo: 'Da mais forte à mais fraca', linhas: c.map(x =>
            '• @' + String(x.outro).split('@')[0] + ' — ' + S.nivelDe(x.nota)) }],
        dica: 'A cada ' + S.MEIA_VIDA_DIAS + ' dias sem gestos, a afinidade cai pela metade.',
        proximos: [
            { nome: 'socialhistorico', args: '@pessoa', oque: 'gestos trocados com alguém' },
            { nome: 'socialperfil', oque: 'resumo do seu perfil' }
        ],
        prefix
    }), mencoes)
    }
}
