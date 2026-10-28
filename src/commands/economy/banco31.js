/**
 * Comando .bancotaxas — TABELA DE TARIFAS
 *
 * Quanto o Reino cobra em cada operação.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/bankingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'bancotaxas',
    aliases: ["tarifas","cmd_bancotaxas","alt_bancotaxas","atalho_bancotaxas","abrev_bancotaxas","call_bancotaxas","func_bancotaxas"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Quanto o Reino cobra em cada operação',
    examples: [' — tarifas do banco e o rendimento diário'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const pct = v => String(Math.round(v * 1000) / 10).replace('.', ',') + '%'
        return reply(F.tela({
            emoji: '📜',
            titulo: 'Tabela de tarifas',
            intro: (B.TARIFAS.saque ? 'Sacar custa ' + pct(B.TARIFAS.saque) + '. ' : 'Sacar é de graça. ') + 'O banco rende *' + pct(B.RENDIMENTO_DIARIO) + '* ao dia sobre o que fica guardado.',
            secoes: [
                { emoji: '💸', titulo: 'Tarifas', linhas: [
                    F.campo('Saque', pct(B.TARIFAS.saque)),
                    F.campo('Transferência', pct(B.TARIFAS.transferencia)),
                    F.campo('Empréstimo', pct(B.TARIFAS.emprestimo)),
                    F.campo('Seguro', pct(B.TARIFAS.seguro))
                ] },
                { emoji: '📈', titulo: 'Rendimento', linhas: [F.campo('Por dia', pct(B.RENDIMENTO_DIARIO))] }
            ],
            dica: 'Um empréstimo de 1.000 moedas custa 150 de juros. Simule antes de pegar.',
            proximos: [
                { nome: 'bancosimularemprestimo', args: '1000 5', oque: 'simular um empréstimo' },
                { nome: 'bancosimularjuros', args: '10000 30', oque: 'simular o rendimento' }
            ],
            prefix
        }))
    }
}
