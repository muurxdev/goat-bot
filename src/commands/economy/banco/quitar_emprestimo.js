const bankingService = require('../../../services/bankingService')

module.exports = {
    name: 'quitar_emprestimo',
    aliases: ["cmd_quitar_emprestimo","atalho_quitar_emprestimo","abrev_quitar_emprestimo"],
    category: 'economy',
    subcategory: 'Crédito & Empréstimo',
    description: 'Amortiza ou liquida sua dívida de empréstimo: .quitar_emprestimo [valor]',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        const amount = args[0] ? parseInt(args[0], 10) : null
        const res = bankingService.payLoan(sender, amount)
        if (!res.success) return reply(res.message)

        let txt = '✅ *PAGAMENTO DE EMPRÉSTIMO PROCESSADO!*\n\n'
        txt += `💰 *Valor Pago:* ${res.paid.toLocaleString('pt-BR')} moedas\n`
        txt += `📉 *Saldo Devedor Restante:* ${res.remainingDue.toLocaleString('pt-BR')} moedas\n`
        if (res.cleared) {
            txt += `🎉 *DÍVIDA 100% QUITADA!*\n`
            txt += `⭐ *Bônus de Score de Crédito:* +${res.scoreBonus} pontos!\n`
        }
        txt += `🏦 *Novo Saldo em Carteira:* ${res.newBalance.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
