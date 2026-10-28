/**
 * Comando .packsugestao — SUGESTÃO DE NOME
 *
 * Sorteia um nome para o seu pacote.
 */

const S = require('../../services/stickerService')
const F = require('../../utils/formato')

module.exports = {
    name: 'packsugestao',
    aliases: ["nomesugerido"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Sorteia um nome para o seu pacote de figurinhas',
    examples: [' — sorteia uma ideia de nome'],
    cooldownMs: 2500,
    execute: async ({ reply, prefix = '.' }) => {
    const nome = S.SUGESTOES_NOME[Math.floor(Math.random() * S.SUGESTOES_NOME.length)]
    return reply(F.tela({
        emoji: '💡',
        titulo: 'Sugestão de nome',
        intro: `🏷️ *${nome}*`,
        secoes: [{ emoji: '⌨️', titulo: 'Para usar', linhas: [F.cmd(prefix, 'packnome', nome)] }],
        dica: `Não gostou? Mande de novo: tenho ${S.SUGESTOES_NOME.length} ideias na lista.`,
        proximos: [
            { nome: 'packsugestao', oque: 'sortear outro nome' },
            { nome: 'packmodelos', oque: 'ver todas as ideias' }
        ],
        prefix
    }))
    }
}
