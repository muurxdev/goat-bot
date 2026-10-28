/**
 * Comando .bancodestrancar — DESTRANCAR SAQUES
 *
 * Remove a trava de saque da sua conta.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/bankingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'bancodestrancar',
    aliases: ["liberarsaques","cmd_bancodestrancar","alt_bancodestrancar","atalho_bancodestrancar","abrev_bancodestrancar","call_bancodestrancar","func_bancodestrancar"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Remove a trava de saque da sua conta',
    examples: [' — remove a trava de saque que você colocou'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const prefs = B.lerPreferencias(user)
        if (!prefs.trancadoAte || prefs.trancadoAte <= Date.now()) {
            return reply(F.tela({
                emoji: '🔓',
                titulo: 'Conta já liberada',
                intro: 'Sua conta não tem trava de saque agora, então não há nada para destrancar.',
                dica: 'Trancar os saques por um tempo ajuda a juntar moedas sem tentação.',
                proximos: [
                    { nome: 'bancotrancar', args: '24', oque: 'trancar os saques por 24 horas' },
                    { nome: 'bancoconta', oque: 'ver a situação da conta' }
                ],
                prefix
            }))
        }
        B.salvarPreferencia(user, 'bancoTrancadoAte', 0)
        return reply(F.tela({
            emoji: '🔓',
            titulo: 'Trava removida',
            intro: 'Seus saques estão liberados de novo. A trava ainda duraria *' + F.tempo(prefs.trancadoAte - Date.now()) + '*.',
            dica: 'Se a trava era para juntar dinheiro, saque só o que precisar.',
            proximos: [
                { nome: 'banco', args: 'sacar <valor>', oque: 'trazer moedas para a carteira' },
                { nome: 'bancotrancar', args: '24', oque: 'trancar de novo' }
            ],
            prefix
        }))
    }
}
