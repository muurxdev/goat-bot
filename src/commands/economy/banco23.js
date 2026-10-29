/**
 * Comando .bancoqueima — RITMO DE GASTO
 *
 * Velocidade com que suas moedas somem.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/tesourariaService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

const VAZIO = 'As movimentações entram aqui quando você deposita, saca ou transfere pelo banco.'

module.exports = {
    name: 'bancoqueima',
    aliases: ["ritmodegasto","cmd_bancoqueima","alt_bancoqueima","atalho_bancoqueima","abrev_bancoqueima","call_bancoqueima","func_bancoqueima"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Velocidade com que suas moedas somem',
    examples: [' — quanto você gasta por dia, semana e ano'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const f = B.fluxo(sender, 30)
        if (!f.saiu) {
            return reply(F.tela({
                emoji: '🔥',
                titulo: 'Ritmo de gasto',
                intro: 'Não encontrei saídas suas nos últimos 30 dias. Quando houver saques ou transferências, eu calculo seu ritmo de gasto.',
                dica: VAZIO,
                proximos: [{ nome: 'bancomes', oque: 'fechamento dos últimos 30 dias' }],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '🔥',
            titulo: 'Ritmo de gasto',
            intro: 'Você gasta em média *' + B.moeda(f.mediaDiariaGasta) + '* por dia.',
            secoes: [{ emoji: '📋', titulo: 'Gasto', linhas: [
                F.campo('Nos últimos 30 dias', B.moeda(f.saiu)),
                F.campo('Por dia', B.moeda(f.mediaDiariaGasta)),
                F.campo('Por semana', B.moeda(f.mediaDiariaGasta * 7)),
                F.campo('Em um ano, nesse ritmo', B.moeda(f.mediaDiariaGasta * 365))
            ] }],
            dica: 'Comparar o gasto com o que entra diz se esse ritmo se sustenta.',
            proximos: [
                { nome: 'bancoautonomia', oque: 'quanto tempo o dinheiro dura' },
                { nome: 'bancotaxadepoupanca', oque: 'quanto você consegue guardar' }
            ],
            prefix
        }))
    }
}
