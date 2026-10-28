/**
 * Comando .apostaperdas — SUAS PERDAS
 *
 * Somente as rodadas em que você perdeu.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostaperdas',
    aliases: ["minhasperdas","cmd_apostaperdas","alt_apostaperdas","atalho_apostaperdas","abrev_apostaperdas","call_apostaperdas","func_apostaperdas"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Somente as rodadas em que você perdeu',
    examples: [' — suas perdas: quantidade, total e as últimas rodadas'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const h = A.historico(sender, { limite: 300 }).filter(l => (Number(l.amount) || 0) < 0)
        if (!h.length) {
            return reply(F.tela({
                emoji: '💸',
                titulo: 'Suas perdas',
                intro: 'Ainda não tenho derrotas suas registradas. Quando houver, eu mostro quanto você perdeu e as últimas rodadas perdidas.',
                proximos: [
                { nome: 'apostaganhos', oque: 'ver o outro lado: as vitórias' },
                { nome: 'apostastop', args: '2000', oque: 'definir a perda máxima' }
            ],
                prefix
            }))
        }
        const total = h.reduce((a, l) => a + Math.abs(Number(l.amount)), 0)
        return reply(F.tela({
            emoji: '💸',
            titulo: 'Suas perdas',
            intro: 'Em *' + h.length + '* rodadas, você perdeu *' + A.moeda(total) + '*.',
            secoes: [
                { emoji: '📋', titulo: 'Resumo', linhas: [
                    F.campo('Derrotas', String(h.length)),
                    F.campo('Total', A.moeda(total)),
                    F.campo('Média por derrota', A.moeda(total / h.length))
                ] },
                { emoji: '🕒', titulo: 'Últimas', linhas: h.slice(0, 10).map(l => '• ' + String(l.created_at || '').slice(8, 10) + '/' + String(l.created_at || '').slice(5, 7) + ' — 🔴 −' + A.moeda(Math.abs(Number(l.amount)))) }
            ],
            dica: 'Se as perdas crescem mais rápido que os ganhos, defina uma perda máxima.',
            proximos: [
                { nome: 'apostaganhos', oque: 'ver o outro lado: as vitórias' },
                { nome: 'apostastop', args: '2000', oque: 'definir a perda máxima' }
            ],
            prefix
        }))
    }
}
