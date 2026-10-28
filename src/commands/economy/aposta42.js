/**
 * Comando .apostamaiorganho — SUA MAIOR VITÓRIA
 *
 * A rodada em que você mais ganhou.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostamaiorganho',
    aliases: ["maiorvitoria","cmd_apostamaiorganho","alt_apostamaiorganho","atalho_apostamaiorganho","abrev_apostamaiorganho","call_apostamaiorganho","func_apostamaiorganho"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'A rodada em que você mais ganhou',
    examples: [' — sua maior vitória, com valor e data'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const h = A.historico(sender, { limite: 500 }).filter(l => (Number(l.amount) || 0) > 0)
        if (!h.length) {
            return reply(F.tela({
                emoji: '🏅',
                titulo: 'Sua maior vitória',
                intro: 'Ainda não tenho vitórias suas registradas. Quando houver, eu mostro a rodada em que você mais ganhou.',
                proximos: [
                { nome: 'apostamaiorperda', oque: 'a rodada em que você mais perdeu' },
                { nome: 'apostaganhos', oque: 'todas as vitórias' }
            ],
                prefix
            }))
        }
        const maior = h.sort((a, b) => Number(b.amount) - Number(a.amount))[0]
        const valor = Math.abs(Number(maior.amount))
        return reply(F.tela({
            emoji: '🏅',
            titulo: 'Sua maior vitória',
            intro: 'Sua melhor rodada rendeu *' + A.moeda(valor) + '*.',
            secoes: [{ emoji: '📋', titulo: 'Rodada', linhas: [
                F.campo('Valor', A.moeda(valor)),
                F.campo('Quando', new Date(maior.created_at).toLocaleString('pt-BR')),
                maior.description ? F.campo('Detalhe', maior.description) : null
            ] }],
            dica: 'Uma vitória grande costuma puxar a vontade de apostar mais alto. Guarde parte do prêmio.',
            proximos: [
                { nome: 'apostamaiorperda', oque: 'a rodada em que você mais perdeu' },
                { nome: 'apostaganhos', oque: 'todas as vitórias' }
            ],
            prefix
        }))
    }
}
