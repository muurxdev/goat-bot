/**
 * Comando .packnome — NOME DO PACOTE
 *
 * Define o nome que aparece nas suas figurinhas.
 */

const S = require('../../services/stickerService')
const F = require('../../utils/formato')

/** Só repassa erros de validação conhecidos; o resto vira frase simples. */
function erroSimples(erro) {
    return /^(No máximo|O valor)/.test(String(erro)) ? erro : 'Não consegui salvar agora. Tente de novo em instantes.'
}

module.exports = {
    name: 'packnome',
    aliases: ["nomepacote"],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Define o nome que aparece nas suas figurinhas',
    usage: '<nome do pacote>',
    examples: [' — mostra o nome atual', 'Pecados Capitais — define o nome do pacote'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    if (!args.length) {
        const p = S.pacote(sender)
        return reply(F.tela({
            emoji: '🏷️',
            titulo: 'Nome do pacote',
            intro: p.nome ? `Suas figurinhas saem com o nome *${p.nome}*.` : 'Você ainda não definiu um nome. Suas figurinhas saem com o nome padrão.',
            secoes: [
                { emoji: '📋', titulo: 'Seu pacote', linhas: [F.campo('Nome', p.nome || 'padrão'), F.campo('Autor', p.autor || 'padrão')] },
                { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'packnome', '<nome>') + ` (até ${S.LIMITES ? S.LIMITES.nomeMax : 40} caracteres)`] },
                { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([F.cmd(prefix, 'packnome', 'Pecados Capitais'), F.cmd(prefix, 'packnome', 'Figurinhas do Grupo')]) }
            ],
            dica: 'O nome aparece quando alguém toca na figurinha no WhatsApp.',
            proximos: [
                { nome: 'packsugestao', oque: 'sortear uma ideia de nome' },
                { nome: 'packautor', args: 'SeuNome', oque: 'definir quem assina' }
            ],
            prefix
        }))
    }
    const r = S.definirPacote(sender, 'nome', args.join(' '))
    if (!r.ok) {
        return reply(F.tela({
            emoji: '🏷️',
            titulo: 'Nome não salvo',
            intro: erroSimples(r.erro),
            secoes: [{ emoji: '📝', titulo: 'Exemplo', linhas: [F.cmd(prefix, 'packnome', 'Pecados Capitais')] }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🏷️',
        titulo: 'Nome do pacote salvo',
        intro: `Suas próximas figurinhas saem com o nome *${r.pacote.nome}*.`,
        secoes: [{ emoji: '📋', titulo: 'Seu pacote', linhas: [F.campo('Nome', r.pacote.nome), F.campo('Autor', r.pacote.autor || 'padrão')] }],
        dica: r.pacote.autor ? 'Guarde essa combinação num perfil para trocar rápido depois.' : 'Falta o autor: defina quem assina para completar o pacote.',
        proximos: [
            r.pacote.autor ? { nome: 'packsalvar', args: 'meu', oque: 'guardar como perfil' } : { nome: 'packautor', args: 'SeuNome', oque: 'definir o autor' },
            { nome: 'fig', oque: 'responda a uma imagem para criar a figurinha' }
        ],
        prefix
    }))
    }
}
