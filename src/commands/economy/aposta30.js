/**
 * Comando .apostameta — META DE GANHO
 *
 * Define quando parar de apostar depois de ganhar.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostameta',
    aliases: ["metaganho","cmd_apostameta","alt_apostameta","atalho_apostameta","abrev_apostameta","call_apostameta","func_apostameta"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Define quando parar de apostar depois de ganhar',
    usage: '[valor]',
    examples: [' — mostra o valor atual e como definir', '100000 — define em 100000 moedas', '0 — remove'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const l = A.limites(user)
        const atual = l.meta
        if (!args[0]) {
            return reply(F.tela({
                emoji: '🎯',
                titulo: 'Meta de ganho',
                intro: atual ? 'Seu valor atual é *' + A.moeda(atual) + '*.' : 'Você ainda não definiu este valor.',
                secoes: [{ emoji: '📌', titulo: 'Para que serve', linhas: ['O lucro em que você decide parar. Quem não define onde parar, para quando o dinheiro acaba.'] },
                    { emoji: '✍️', titulo: 'Digite assim', linhas: [
                        '• ' + F.cmd(prefix, 'apostameta', '100000') + ' — define em ' + A.moeda(100000),
                        '• ' + F.cmd(prefix, 'apostameta', '0') + ' — remove'
                    ] }],
                dica: 'Uma meta pequena e realista é mais fácil de respeitar do que uma grande.',
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
                    '• ' + F.cmd(prefix, 'apostameta', '100000'),
                    '• ' + F.cmd(prefix, 'apostameta', '0') + ' — remove'
                ] }],
                prefix
            }))
        }
        A.salvarLimite(user, 'apostaMeta', v)
        if (v === 0) {
            return reply(F.tela({
                emoji: '🎯',
                titulo: 'Meta de ganho removida',
                intro: atual ? 'O valor de ' + A.moeda(atual) + ' foi apagado.' : 'Não havia valor definido; continua sem.',
                proximos: [
                    { nome: 'apostalimites', oque: 'ver todos os seus limites' },
                    { nome: 'apostaalerta', oque: 'ver se passou de algum' }
                ],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '🎯',
            titulo: 'Meta de ganho definido',
            intro: 'Agora está em *' + A.moeda(v) + '*' + (atual ? ' (antes: ' + A.moeda(atual) + ').' : '.'),
            dica: 'Ao atingir a meta, pare. O lucro só é seu depois que sai da mesa.',
            proximos: [
                { nome: 'apostalimites', oque: 'ver todos os seus limites' },
                { nome: 'apostaalerta', oque: 'ver se passou de algum' }
            ],
            prefix
        }))
    }
}
