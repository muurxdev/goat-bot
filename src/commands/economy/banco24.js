/**
 * Comando .bancoautonomia — AUTONOMIA
 *
 * Quanto tempo seu dinheiro dura no ritmo atual.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/bankingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

const VAZIO = 'As movimentações entram aqui quando você deposita, saca ou transfere pelo banco.'

module.exports = {
    name: 'bancoautonomia',
    aliases: ["quantotempoduro","cmd_bancoautonomia","alt_bancoautonomia","atalho_bancoautonomia","abrev_bancoautonomia","call_bancoautonomia","func_bancoautonomia"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Quanto tempo seu dinheiro dura no ritmo atual',
    examples: [' — quantos dias seu dinheiro dura no ritmo de gasto atual'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const a = B.autonomia(user, sender)
        if (a.dias === null) {
            const p = B.patrimonio(user)
            return reply(F.tela({
                emoji: '⌛',
                titulo: 'Autonomia',
                intro: 'Não encontrei gastos seus nos últimos 30 dias, então não dá para calcular quanto tempo o dinheiro dura.',
                secoes: [{ emoji: '💳', titulo: 'Seu dinheiro', linhas: [F.campo('Patrimônio', B.moeda(p.total))] }],
                dica: VAZIO,
                proximos: [
                    { nome: 'bancoresumo', oque: 'ver carteira, banco e cofre' },
                    { nome: 'bancoqueima', oque: 'ver o ritmo de gasto' }
                ],
                prefix
            }))
        }
        const veredito = a.dias < 7 ? '🔴 Menos de uma semana. Segure os gastos.' : a.dias < 30 ? '🟡 Menos de um mês de folga.' : '🟢 Você está confortável.'
        return reply(F.tela({
            emoji: '⌛',
            titulo: 'Autonomia',
            intro: 'No ritmo atual, seu dinheiro dura *' + a.dias + ' dias*. ' + veredito,
            secoes: [{ emoji: '📋', titulo: 'A conta', linhas: [
                F.campo('Patrimônio', B.moeda(a.total)),
                F.campo('Gasto por dia', B.moeda(a.gastoDiario)),
                F.campo('Dura', a.dias + ' dias')
            ] }],
            dica: 'Cortar um pouco do gasto diário aumenta a autonomia mais rápido do que parece.',
            proximos: [
                { nome: 'bancoqueima', oque: 'ver para onde vai o gasto' },
                { nome: 'bancoreserva', oque: 'quanto guardar para emergências' }
            ],
            prefix
        }))
    }
}
