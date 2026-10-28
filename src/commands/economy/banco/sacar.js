const bankingService = require('../../../services/bankingService')

module.exports = {
    name: 'sacar',
    aliases: ["cmd_sacar","atalho_sacar","abrev_sacar"],
    category: 'economy',
    subcategory: 'Banco Real',
    description: 'Resgata moedas da poupança para sua carteira líquida: .sacar <valor>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.sacar <valor>`\nExemplo: `.sacar 2000`')
        const amount = parseInt(args[0], 10)
        const res = bankingService.withdrawSavings(sender, amount)
        if (!res.success) return reply(res.message)

        let txt = '💸 *SAQUE REALIZADO COM SUCESSO!*\n\n'
        txt += `💰 *Valor Sacado:* ${res.withdrawn.toLocaleString('pt-BR')} moedas\n`
        txt += `👛 *Novo Saldo em Carteira:* ${res.walletBalance.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Restante na Poupança:* ${res.savingsBalance.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
