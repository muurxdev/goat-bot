/**
 * Comando .apostavoltar — RETOMAR APOSTAS
 *
 * Remove a pausa que você mesmo se impôs.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostavoltar',
    aliases: ["retomarapostas","cmd_apostavoltar","alt_apostavoltar","atalho_apostavoltar","abrev_apostavoltar","call_apostavoltar","func_apostavoltar"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Remove a pausa que você mesmo se impôs',
    examples: [' — encerra a pausa de apostas que você mesmo pediu'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const p = A.emPausa(user)
        if (!p.pausado) {
            return reply(F.tela({
                emoji: '▶️',
                titulo: 'Você não está em pausa',
                intro: 'Não há pausa de apostas para encerrar.',
                proximos: [
                    { nome: 'apostaparar', args: '24', oque: 'pausar por 24 horas' },
                    { nome: 'apostapausa', oque: 'conferir a situação' }
                ],
                prefix
            }))
        }
        A.salvarLimite(user, 'apostaPausaAte', 0)
        return reply(F.tela({
            emoji: '▶️',
            titulo: 'Pausa encerrada',
            intro: 'Tirei sua pausa. Ainda faltavam *' + A.duracao(p.restanteMs) + '*.',
            secoes: [{ emoji: '📋', titulo: 'Antes de voltar', linhas: [
                F.campo('Pausa terminaria em', new Date(p.ate).toLocaleString('pt-BR')),
                F.campo('Resultado das últimas 24 h', (() => { const d = A.desempenho(sender, 1); return (d.saldo >= 0 ? '+' : '') + A.moeda(d.saldo) })())
            ] }],
            dica: 'Pense duas vezes antes da próxima rodada: a pausa existia por um motivo.',
            proximos: [
                { nome: 'apostalimitediario', args: '5000', oque: 'voltar com um teto diário' },
                { nome: 'apostaparar', args: '24', oque: 'pausar de novo' }
            ],
            prefix
        }))
    }
}
