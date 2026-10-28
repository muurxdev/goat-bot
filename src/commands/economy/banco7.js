/**
 * Comando .bancomes — FECHAMENTO DO MÊS
 *
 * Quanto entrou, saiu e sobrou em 30 dias.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/bankingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

const VAZIO = 'As movimentações entram aqui quando você deposita, saca ou transfere pelo banco.'

module.exports = {
    name: 'bancomes',
    aliases: ["fechamentomes","cmd_bancomes","alt_bancomes","atalho_bancomes","abrev_bancomes","call_bancomes","func_bancomes"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Quanto entrou, saiu e sobrou em 30 dias',
    examples: [' — quanto entrou, saiu e sobrou nos últimos 30 dias'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const f = B.fluxo(sender, 30)
        if (!f.movimentacoes) {
            return reply(F.tela({
                emoji: '🗓️',
                titulo: 'Fechamento do mês',
                intro: 'Não encontrei movimentações suas nos últimos 30 dias.',
                dica: VAZIO,
                proximos: [
                    { nome: 'banco', args: 'depositar 100', oque: 'guardar moedas no banco' },
                    { nome: 'bancoresumo', oque: 'ver carteira, banco e cofre' }
                ],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '🗓️',
            titulo: 'Fechamento do mês',
            intro: f.saldo >= 0
                ? '🟢 Nos últimos 30 dias sobraram *' + B.moeda(f.saldo) + '*.'
                : '🔴 Nos últimos 30 dias saíram *' + B.moeda(Math.abs(f.saldo)) + '* a mais do que entraram.',
            secoes: [{ emoji: '📋', titulo: 'Resumo', linhas: [
                F.campo('Movimentações', String(f.movimentacoes)),
                F.campo('Entrou', B.moeda(f.entrou)),
                F.campo('Saiu', B.moeda(f.saiu)),
                F.campo('Resultado', (f.saldo >= 0 ? '🟢 +' : '🔴 ') + B.moeda(f.saldo)),
                f.entrou > 0 && f.saldo >= 0 ? F.campo('Guardou', f.taxaDePoupanca.toFixed(1).replace('.', ',') + '% do que entrou') : null
            ] }],
            dica: 'Guardar 10% ou mais do que entra já é um bom hábito.',
            proximos: [
                { nome: 'bancosemana', oque: 'resultado dos últimos 7 dias' },
                { nome: 'bancotaxadepoupanca', oque: 'quanto você consegue guardar' }
            ],
            prefix
        }))
    }
}
