const bankingService = require('../../../services/bankingService')

module.exports = {
    name: 'resgatarcdb',
    aliases: ["cmd_resgatarcdb","atalho_resgatarcdb","abrev_resgatarcdb"],
    category: 'economy',
    subcategory: 'Renda Fixa',
    description: 'Recolhe o valor principal e os juros de todos os seus CDBs vencidos',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const res = bankingService.claimMaturedCDBs(sender)
        if (!res.success) return reply(res.message)

        let txt = '🎉 *CDBs RESGATADOS COM SUCESSO!*\n\n'
        txt += `📜 *Títulos Liquidados:* ${res.count} certificado(s)\n`
        txt += `💰 *Total Creditado (Principal + Juros):* +${res.totalRedeemed.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Novo Saldo em Carteira:* ${res.newBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Reinvista em novos CDBs com `.investircdb` para continuar multiplicando seu patrimônio!'
        return reply(txt.trim())
    }
}
