/**
 * Comando .apostalimitediario — LIMITE DIÁRIO
 *
 * Define quanto você pode apostar por dia.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostalimitediario',
    aliases: ["limitediarioaposta","cmd_apostalimitediario","alt_apostalimitediario","atalho_apostalimitediario","abrev_apostalimitediario","call_apostalimitediario","func_apostalimitediario"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Define quanto você pode apostar por dia',
    usage: '[valor]',
    examples: [' — mostra o valor atual e como definir', '50000 — define em 50000 moedas', '0 — remove'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const l = A.limites(user)
        const atual = l.diario
        if (!args[0]) {
            return reply(F.tela({
                emoji: '📅',
                titulo: 'Limite diário',
                intro: atual ? 'Seu valor atual é *' + A.moeda(atual) + '*.' : 'Você ainda não definiu este valor.',
                secoes: [{ emoji: '📌', titulo: 'Para que serve', linhas: ['Quanto você se permite apostar somando as rodadas de um dia.'] },
                    { emoji: '✍️', titulo: 'Digite assim', linhas: [
                        '• ' + F.cmd(prefix, 'apostalimitediario', '50000') + ' — define em ' + A.moeda(50000),
                        '• ' + F.cmd(prefix, 'apostalimitediario', '0') + ' — remove'
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
                    '• ' + F.cmd(prefix, 'apostalimitediario', '50000'),
                    '• ' + F.cmd(prefix, 'apostalimitediario', '0') + ' — remove'
                ] }],
                prefix
            }))
        }
        A.salvarLimite(user, 'apostaLimiteDiario', v)
        if (v === 0) {
            return reply(F.tela({
                emoji: '📅',
                titulo: 'Limite diário removido',
                intro: atual ? 'O valor de ' + A.moeda(atual) + ' foi apagado.' : 'Não havia valor definido; continua sem.',
                proximos: [
                    { nome: 'apostalimites', oque: 'ver todos os seus limites' },
                    { nome: 'apostaalerta', oque: 'ver se passou de algum' }
                ],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '📅',
            titulo: 'Limite diário definido',
            intro: 'Agora está em *' + A.moeda(v) + '*' + (atual ? ' (antes: ' + A.moeda(atual) + ').' : '.'),
            secoes: [{ emoji: '☀️', titulo: 'Hoje', linhas: [F.campo('Já apostou', A.moeda(A.desempenho(sender, 1).apostado))] }],
            proximos: [
                { nome: 'apostalimites', oque: 'ver todos os seus limites' },
                { nome: 'apostaalerta', oque: 'ver se passou de algum' }
            ],
            prefix
        }))
    }
}
