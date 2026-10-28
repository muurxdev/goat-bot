const bankingService = require('../../../services/bankingService')

module.exports = {
    name: 'investircdb',
    aliases: ["cmd_investircdb","atalho_investircdb","abrev_investircdb"],
    category: 'economy',
    subcategory: 'Renda Fixa',
    description: 'Aplica moedas em um plano CDB de renda fixa: .investircdb <plano> <valor>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0] || !args[1]) return reply('Uso correto: `.investircdb <plano> <valor>`\nExemplo: `.investircdb cdb1 500`\nDigite `.cdb` para ver os planos.')
        const planKey = args[0]
        const amount = parseInt(args[1], 10)
        const res = bankingService.investCDB(sender, planKey, amount)
        if (!res.success) return reply(res.message)

        const matureDate = new Date(res.maturesAt).toLocaleString('pt-BR')
        let txt = '🎉 *APLICAÇÃO EM RENDA FIXA CONFIRMADA!*\n\n'
        txt += `📄 *Certificado:* ${res.invId}\n`
        txt += `📜 *Plano:* ${res.plan.name}\n`
        txt += `💰 *Valor Aportado:* ${res.amount.toLocaleString('pt-BR')} moedas\n`
        txt += `📈 *Rendimento Contratado:* +${(res.plan.yieldRate * 100).toFixed(1)}%\n`
        txt += `💵 *Resgate Estimado no Vencimento:* ${res.estimatedTotal.toLocaleString('pt-BR')} moedas\n`
        txt += `📅 *Data de Liquidação:* ${matureDate}\n`
        txt += `🏦 *Saldo Restante na Carteira:* ${res.remainingWallet.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
