/**
 * Comando .packautor — AUTOR DO PACOTE
 *
 * Define quem assina suas figurinhas.
 */

const S = require('../../services/stickerService')
const F = require('../../utils/formato')

/** Só repassa erros de validação conhecidos; o resto vira frase simples. */
function erroSimples(erro) {
    return /^(No máximo|O valor)/.test(String(erro)) ? erro : 'Não consegui salvar agora. Tente de novo em instantes.'
}

module.exports = {
    name: 'packautor',
    aliases: ["autorpacote"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Define quem assina suas figurinhas',
    usage: '<autor>',
    examples: [' — mostra o autor atual', '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ — define o autor'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    if (!args.length) {
        const p = S.pacote(sender)
        return reply(F.tela({
            emoji: '✍️',
            titulo: 'Autor do pacote',
            intro: p.autor ? `Suas figurinhas saem assinadas por *${p.autor}*.` : 'Você ainda não definiu um autor. Suas figurinhas saem com a assinatura padrão.',
            secoes: [
                { emoji: '📋', titulo: 'Seu pacote', linhas: [F.campo('Nome', p.nome || 'padrão'), F.campo('Autor', p.autor || 'padrão')] },
                { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'packautor', '<autor>') + ' (até 40 caracteres)'] },
                { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([F.cmd(prefix, 'packautor', '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤'), F.cmd(prefix, 'packautor', '@seuinsta')]) }
            ],
            dica: 'O autor aparece embaixo do nome do pacote quando alguém toca na figurinha.',
            proximos: [
                { nome: 'packnome', args: 'Meu Pacote', oque: 'definir o nome do pacote' },
                { nome: 'packver', oque: 'ver o pacote completo' }
            ],
            prefix
        }))
    }
    const r = S.definirPacote(sender, 'autor', args.join(' '))
    if (!r.ok) {
        return reply(F.tela({
            emoji: '✍️',
            titulo: 'Autor não salvo',
            intro: erroSimples(r.erro),
            secoes: [{ emoji: '📝', titulo: 'Exemplo', linhas: [F.cmd(prefix, 'packautor', '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤')] }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '✍️',
        titulo: 'Autor do pacote salvo',
        intro: `Suas próximas figurinhas saem assinadas por *${r.pacote.autor}*.`,
        secoes: [{ emoji: '📋', titulo: 'Seu pacote', linhas: [F.campo('Nome', r.pacote.nome || 'padrão'), F.campo('Autor', r.pacote.autor)] }],
        dica: r.pacote.nome ? 'Guarde essa combinação num perfil para trocar rápido depois.' : 'Falta o nome: defina o nome do pacote para completar.',
        proximos: [
            r.pacote.nome ? { nome: 'packsalvar', args: 'meu', oque: 'guardar como perfil' } : { nome: 'packnome', args: 'Meu Pacote', oque: 'definir o nome' },
            { nome: 'fig', oque: 'responda a uma imagem para criar a figurinha' }
        ],
        prefix
    }))
    }
}
