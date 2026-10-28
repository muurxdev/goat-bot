const bankingService = require('../../../services/bankingService')

module.exports = {
    name: 'pediremprestimo',
    aliases: ["cmd_pediremprestimo","atalho_pediremprestimo","abrev_pediremprestimo"],
    category: 'economy',
    subcategory: 'Crédito & Empréstimo',
    description: 'Solicita um empréstimo bancário conforme seu score de crédito: .pediremprestimo <valor>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.pediremprestimo <valor> [parcelas]`\nExemplo: `.pediremprestimo 5000 3`')
        const amount = parseInt(args[0], 10)
        const installments = parseInt(args[1], 10) || 3
        const res = bankingService.requestLoan(sender, amount, installments)
        if (!res.success) return reply(res.message)

        let txt = '🎉 *EMPRÉSTIMO BANCÁRIO LIBERADO NA SUA CONTA!*\n\n'
        txt += `💰 *Valor Concedido:* ${res.granted.toLocaleString('pt-BR')} moedas\n`
        txt += `💳 *Total a Pagar (com juros):* ${res.totalDue.toLocaleString('pt-BR')} moedas\n`
        txt += `📅 *Plano de Pagamento:* ${res.installments} parcelas de ${res.installmentValue.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Novo Saldo em Carteira:* ${res.newBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Quite parcelas a qualquer momento com `.quitar_emprestimo <valor>` para aumentar seu Score.'
        return reply(txt.trim())
    }
}
