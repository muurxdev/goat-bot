/**
 * Comando .apostaganhos — SEUS GANHOS
 *
 * Somente as rodadas em que você ganhou.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostaganhos',
    aliases: ["meusganhos","cmd_apostaganhos","alt_apostaganhos","atalho_apostaganhos","abrev_apostaganhos","call_apostaganhos","func_apostaganhos"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Somente as rodadas em que você ganhou',
    examples: [' — seus ganhos: quantidade, total e as últimas rodadas'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const h = A.historico(sender, { limite: 300 }).filter(l => (Number(l.amount) || 0) > 0)
        if (!h.length) {
            return reply(F.tela({
                emoji: '💰',
                titulo: 'Seus ganhos',
                intro: 'Ainda não tenho vitórias suas registradas. Quando houver, eu mostro quanto você ganhou e as últimas rodadas vencidas.',
                proximos: [
                { nome: 'apostaperdas', oque: 'ver o outro lado: as derrotas' },
                { nome: 'apostasaldo', oque: 'ver se está no lucro' }
            ],
                prefix
            }))
        }
        const total = h.reduce((a, l) => a + Math.abs(Number(l.amount)), 0)
        return reply(F.tela({
            emoji: '💰',
            titulo: 'Seus ganhos',
            intro: 'Em *' + h.length + '* rodadas, você ganhou *' + A.moeda(total) + '*.',
            secoes: [
                { emoji: '📋', titulo: 'Resumo', linhas: [
                    F.campo('Vitórias', String(h.length)),
                    F.campo('Total', A.moeda(total)),
                    F.campo('Média por vitória', A.moeda(total / h.length))
                ] },
                { emoji: '🕒', titulo: 'Últimas', linhas: h.slice(0, 10).map(l => '• ' + String(l.created_at || '').slice(8, 10) + '/' + String(l.created_at || '').slice(5, 7) + ' — 🟢 +' + A.moeda(Math.abs(Number(l.amount)))) }
            ],
            dica: 'Olhe os ganhos junto com as perdas: só um lado da conta engana.',
            proximos: [
                { nome: 'apostaperdas', oque: 'ver o outro lado: as derrotas' },
                { nome: 'apostasaldo', oque: 'ver se está no lucro' }
            ],
            prefix
        }))
    }
}
