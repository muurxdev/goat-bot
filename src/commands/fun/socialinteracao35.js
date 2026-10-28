/**
 * Comando .socialsolitarios — MAIS DISTANTES
 *
 * Quem quase não aparece nos gestos do grupo.
 */

const S = require('../../services/socialService')
const F = require('../../utils/formato')

module.exports = {
    name: 'socialsolitarios',
    aliases: ["menossociaveis"],
    category: 'fun',
    subcategory: 'Interação Social',
    description: 'Quem quase não aparece nos gestos do grupo',
    examples: [" — mostra quem quase não troca gestos no grupo"],
    cooldownMs: 3000,
    execute: async ({ reply, sender, from, isGroup, prefix = '.' }) => {
        if (!isGroup) return reply('🏰 Os vínculos sociais são contados por grupo. Use este comando dentro de um grupo.')
    const p = S.porPessoa(from).sort((a, b) => (a.enviados + a.recebidos) - (b.enviados + b.recebidos)).slice(0, 10)
    if (!p.length) {
        return reply(F.tela({
            emoji: '🌑', titulo: 'Mais distantes',
            intro: 'Ainda não há lista: ninguém trocou gestos neste grupo.',
            secoes: [{ emoji: '📜', titulo: 'O que aparece aqui', linhas: [
                'Quem menos troca gestos, para o grupo lembrar de incluir essas pessoas.',
                'Só entra quem já participou de pelo menos um gesto.'
            ] }],
            dica: 'Um ' + F.cmd(prefix, 'acolher', '@pessoa') + ' é um bom jeito de chamar alguém para a roda.',
            proximos: [
                { nome: 'acolher', args: '@pessoa', oque: 'acolher alguém' },
                { nome: 'socialcatalogo', oque: 'ver todos os gestos' }
            ],
            prefix
        }))
    }
    const mencoes = p.map(x => x.jid)
    return reply(F.tela({
        emoji: '🌑', titulo: 'Mais distantes',
        intro: 'Quem menos aparece nos gestos do grupo.',
        secoes: [{ emoji: '🕯️', titulo: 'Pouca interação', linhas: p.map(x =>
            '• @' + String(x.jid).split('@')[0] + ' — ' + (x.enviados + x.recebidos) + ((x.enviados + x.recebidos) === 1 ? ' interação' : ' interações')) }],
        dica: 'Que tal um gesto para quem aparece pouco?',
        proximos: [
            { nome: 'acolher', args: '@pessoa', oque: 'acolher alguém' },
            { nome: 'convidar', args: '@pessoa', oque: 'mandar um convite' }
        ],
        prefix
    }), mencoes)
    }
}
