/**
 * Comando .packlimpar — LIMPAR IDENTIDADE
 *
 * Volta ao nome e autor padrão das figurinhas.
 */

const S = require('../../services/stickerService')
const F = require('../../utils/formato')

module.exports = {
    name: 'packlimpar',
    aliases: ["resetarpacote"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Volta suas figurinhas para o nome e o autor padrão',
    examples: [' — apaga seu nome e autor personalizados'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, prefix = '.' }) => {
    const p = S.pacote(sender)
    if (!p.nome && !p.autor) {
        return reply(F.tela({
            emoji: '🧹',
            titulo: 'Já está no padrão',
            intro: 'Você não tem nome nem autor personalizados, então não há nada para limpar.',
            proximos: [
                { nome: 'packnome', args: 'Meu Pacote', oque: 'personalizar o nome' },
                { nome: 'packperfis', oque: 'ver perfis salvos' }
            ],
            prefix
        }))
    }
    S.limparPacote(sender)
    return reply(F.tela({
        emoji: '🧹',
        titulo: 'Identidade removida',
        intro: 'Suas próximas figurinhas voltam a usar o nome e o autor padrão.',
        secoes: [{ emoji: '📋', titulo: 'O que saiu', linhas: [F.campo('Nome', p.nome || '—'), F.campo('Autor', p.autor || '—')] }],
        dica: 'Seus perfis salvos continuam guardados; dá para voltar a qualquer um.',
        proximos: [
            { nome: 'packperfis', oque: 'ver perfis salvos' },
            { nome: 'packnome', args: p.nome || 'Meu Pacote', oque: 'definir o nome de novo' }
        ],
        prefix
    }))
    }
}
