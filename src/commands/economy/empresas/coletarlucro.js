const companyService = require('../../../services/companyService')

module.exports = {
    name: 'coletarlucro',
    aliases: ["cmd_coletarlucro","atalho_coletarlucro","abrev_coletarlucro"],
    category: 'economy',
    subcategory: 'Empresas',
    description: 'Recolhe o lucro acumulado gerado pela sua empresa',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const res = companyService.collectRevenue(sender)
        if (!res.success) return reply(res.message)

        let txt = '💵 *LUCRO CORPORATIVO RECOLHIDO COM SUCESSO!*\n\n'
        txt += `🏢 *Empresa:* ${res.companyName}\n`
        txt += `⏳ *Período de Produção:* ${res.elapsedHours} horas\n`
        txt += `💰 *Lucro Transferido:* +${res.profit.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Novo Saldo em Carteira:* ${res.newBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Seus funcionários continuam trabalhando e gerando lucro 24 horas por dia!'
        return reply(txt.trim())
    }
}
