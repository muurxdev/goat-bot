/**
 * Comando .apostastop — LIMITE DE PERDA
 *
 * Define quanto pode perder antes de parar.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostastop',
    aliases: ["stopperda","cmd_apostastop","alt_apostastop","atalho_apostastop","abrev_apostastop","call_apostastop","func_apostastop"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Define quanto pode perder antes de parar',
    usage: '[valor]',
    examples: [' — mostra o valor atual e como definir', '20000 — define em 20000 moedas', '0 — remove'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const l = A.limites(user)
        const atual = l.stopPerda
        if (!args[0]) {
            return reply(F.tela({
                emoji: '🛑',
                titulo: 'Limite de perda',
                intro: atual ? 'Seu valor atual é *' + A.moeda(atual) + '*.' : 'Você ainda não definiu este valor.',
                secoes: [{ emoji: '📌', titulo: 'Para que serve', linhas: ['A perda máxima do dia: chegou nela, é hora de parar.'] },
                    { emoji: '✍️', titulo: 'Digite assim', linhas: [
                        '• ' + F.cmd(prefix, 'apostastop', '20000') + ' — define em ' + A.moeda(20000),
                        '• ' + F.cmd(prefix, 'apostastop', '0') + ' — remove'
                    ] }],
                dica: 'Escolha um valor que você aceitaria perder sem se arrepender.',
                proximos: [
                    { nome: 'apostalimites', oque: 'ver todos os seus limites' },
                    { nome: 'apostaalerta', oque: 'ver se passou de algum' }
                ],
                prefix
            }))
        }
        const v = parseInt(String(args[0]).replace(/\D/g, ''), 10)
        if (isNaN(v) || v < 0) {
            return reply(F.tela({
                emoji: '🔢',
                titulo: 'Não entendi o valor',
                intro: '"' + String(args[0]).slice(0, 30) + '" não é um número. Digite só o valor em moedas.',
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    '• ' + F.cmd(prefix, 'apostastop', '20000'),
                    '• ' + F.cmd(prefix, 'apostastop', '0') + ' — remove'
                ] }],
                prefix
            }))
        }
        A.salvarLimite(user, 'apostaStopPerda', v)
        if (v === 0) {
            return reply(F.tela({
                emoji: '🛑',
                titulo: 'Limite de perda removido',
                intro: atual ? 'O valor de ' + A.moeda(atual) + ' foi apagado.' : 'Não havia valor definido; continua sem.',
                proximos: [
                    { nome: 'apostalimites', oque: 'ver todos os seus limites' },
                    { nome: 'apostaalerta', oque: 'ver se passou de algum' }
                ],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '🛑',
            titulo: 'Limite de perda definido',
            intro: 'Agora está em *' + A.moeda(v) + '*' + (atual ? ' (antes: ' + A.moeda(atual) + ').' : '.'),
            secoes: [(() => { const d = A.desempenho(sender, 1); return { emoji: '☀️', titulo: 'Hoje', linhas: [F.campo('Resultado', (d.saldo >= 0 ? '+' : '') + A.moeda(d.saldo))] } })()],
            proximos: [
                { nome: 'apostalimites', oque: 'ver todos os seus limites' },
                { nome: 'apostaalerta', oque: 'ver se passou de algum' }
            ],
            prefix
        }))
    }
}
