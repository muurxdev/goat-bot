/**
 * Comando .apostamaiorperda — SUA MAIOR PERDA
 *
 * A rodada em que você mais perdeu.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostamaiorperda',
    aliases: ["maiorderrota","cmd_apostamaiorperda","alt_apostamaiorperda","atalho_apostamaiorperda","abrev_apostamaiorperda","call_apostamaiorperda","func_apostamaiorperda"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'A rodada em que você mais perdeu',
    examples: [' — sua maior perda, com valor e data'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const h = A.historico(sender, { limite: 500 }).filter(l => (Number(l.amount) || 0) < 0)
        if (!h.length) {
            return reply(F.tela({
                emoji: '💔',
                titulo: 'Sua maior perda',
                intro: 'Ainda não tenho derrotas suas registradas. Quando houver, eu mostro a rodada em que você mais perdeu.',
                proximos: [
                { nome: 'apostamaiorganho', oque: 'a rodada em que você mais ganhou' },
                { nome: 'apostalimite', args: '1000', oque: 'definir um teto por aposta' }
            ],
                prefix
            }))
        }
        const maior = h.sort((a, b) => Math.abs(Number(b.amount)) - Math.abs(Number(a.amount)))[0]
        const valor = Math.abs(Number(maior.amount))
        return reply(F.tela({
            emoji: '💔',
            titulo: 'Sua maior perda',
            intro: 'Sua pior rodada levou *' + A.moeda(valor) + '*.',
            secoes: [{ emoji: '📋', titulo: 'Rodada', linhas: [
                F.campo('Valor', A.moeda(valor)),
                F.campo('Quando', new Date(maior.created_at).toLocaleString('pt-BR'))
            ] }],
            dica: 'Se essa perda doeu, um limite por aposta impede que ela se repita no mesmo tamanho.',
            proximos: [
                { nome: 'apostamaiorganho', oque: 'a rodada em que você mais ganhou' },
                { nome: 'apostalimite', args: '1000', oque: 'definir um teto por aposta' }
            ],
            prefix
        }))
    }
}
