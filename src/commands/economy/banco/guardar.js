const bankingService = require('../../../services/bankingService')

module.exports = {
    name: 'guardar',
    aliases: ["cmd_guardar","atalho_guardar","abrev_guardar"],
    category: 'economy',
    subcategory: 'Banco Real',
    description: 'Deposita moedas na poupança protegida contra roubos: .guardar <valor>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.guardar <valor>`\nExemplo: `.guardar 5000`')
        const amount = parseInt(args[0], 10)
        const res = bankingService.depositSavings(sender, amount)
        if (!res.success) return reply(res.message)

        let txt = '✅ *DEPÓSITO REALIZADO COM SUCESSO!*\n\n'
        txt += `💰 *Valor Guardado:* ${res.deposited.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Atual da Poupança:* ${res.savingsBalance.toLocaleString('pt-BR')} moedas\n`
        txt += `👛 *Saldo Restante na Carteira:* ${res.walletBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '🛡️ Suas moedas na poupança estão totalmente seguras!'
        return reply(txt.trim())
    }
}
