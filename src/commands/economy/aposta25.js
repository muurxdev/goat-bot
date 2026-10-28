/**
 * Comando .apostalimite — LIMITE POR APOSTA
 *
 * Define um teto para cada aposta sua.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostalimite',
    aliases: ["limiteaposta","cmd_apostalimite","alt_apostalimite","atalho_apostalimite","abrev_apostalimite","call_apostalimite","func_apostalimite"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Define um teto para cada aposta sua',
    usage: '[valor]',
    examples: [' — mostra o valor atual e como definir', '5000 — define em 5000 moedas', '0 — remove'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const l = A.limites(user)
        const atual = l.porAposta
        if (!args[0]) {
            return reply(F.tela({
                emoji: '🚧',
                titulo: 'Limite por aposta',
                intro: atual ? 'Seu valor atual é *' + A.moeda(atual) + '*.' : 'Você ainda não definiu este valor.',
                secoes: [{ emoji: '📌', titulo: 'Para que serve', linhas: ['Um teto para o valor de cada rodada, para uma aposta só não levar tudo.'] },
                    { emoji: '✍️', titulo: 'Digite assim', linhas: [
                        '• ' + F.cmd(prefix, 'apostalimite', '5000') + ' — define em ' + A.moeda(5000),
                        '• ' + F.cmd(prefix, 'apostalimite', '0') + ' — remove'
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
                    '• ' + F.cmd(prefix, 'apostalimite', '5000'),
                    '• ' + F.cmd(prefix, 'apostalimite', '0') + ' — remove'
                ] }],
                prefix
            }))
        }
        A.salvarLimite(user, 'apostaLimite', v)
        if (v === 0) {
            return reply(F.tela({
                emoji: '🚧',
                titulo: 'Limite por aposta removido',
                intro: atual ? 'O valor de ' + A.moeda(atual) + ' foi apagado.' : 'Não havia valor definido; continua sem.',
                proximos: [
                    { nome: 'apostalimites', oque: 'ver todos os seus limites' },
                    { nome: 'apostaalerta', oque: 'ver se passou de algum' }
                ],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '🚧',
            titulo: 'Limite por aposta definido',
            intro: 'Agora está em *' + A.moeda(v) + '*' + (atual ? ' (antes: ' + A.moeda(atual) + ').' : '.'),
            proximos: [
                { nome: 'apostalimites', oque: 'ver todos os seus limites' },
                { nome: 'apostaalerta', oque: 'ver se passou de algum' }
            ],
            prefix
        }))
    }
}
