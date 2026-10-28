/**
 * Comando .packver — IDENTIDADE DO PACOTE
 *
 * Mostra nome e autor configurados.
 */

const S = require('../../services/stickerService')
const F = require('../../utils/formato')

module.exports = {
    name: 'packver',
    aliases: ["verpacote"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Mostra o nome e o autor que suas figurinhas usam',
    examples: [' — mostra seu pacote'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, prefix = '.' }) => {
    const p = S.pacote(sender)
    const c = S.contagem(sender)
    const perfis = Object.keys(S.presets(sender))
    if (!p.nome && !p.autor) {
        return reply(F.tela({
            emoji: '📦',
            titulo: 'Identidade do pacote',
            intro: 'Você ainda não personalizou seu pacote: suas figurinhas saem com o nome e o autor padrão.',
            secoes: [{
                emoji: '📋', titulo: 'Como personalizar',
                linhas: F.lista([
                    F.cmd(prefix, 'packnome', 'Meu Pacote') + ' — nome que aparece na figurinha',
                    F.cmd(prefix, 'packautor', 'SeuNome') + ' — quem assina',
                    F.cmd(prefix, 'packsalvar', 'meu') + ' — guardar a combinação'
                ])
            }],
            dica: 'Sem ideia de nome? Peça uma sugestão.',
            proximos: [{ nome: 'packsugestao', oque: 'sortear um nome' }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '📦',
        titulo: 'Identidade do pacote',
        intro: `*${p.nome || 'nome padrão'}* · por *${p.autor || 'autor padrão'}*`,
        secoes: [{
            emoji: '📋', titulo: 'Seu pacote',
            linhas: [
                F.campo('Nome', p.nome || 'padrão'),
                F.campo('Autor', p.autor || 'padrão'),
                F.campo('Figurinhas criadas', String(c.total)),
                F.campo('Perfis salvos', perfis.length ? `${perfis.length} (${perfis.join(', ')})` : 'nenhum')
            ]
        }],
        proximos: [
            !p.nome ? { nome: 'packnome', args: 'Meu Pacote', oque: 'definir o nome' } : null,
            !p.autor ? { nome: 'packautor', args: 'SeuNome', oque: 'definir o autor' } : null,
            { nome: 'packsalvar', args: 'meu', oque: 'guardar como perfil' },
            { nome: 'packlimpar', oque: 'voltar ao padrão' }
        ].filter(Boolean),
        prefix
    }))
    }
}
