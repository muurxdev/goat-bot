const companyService = require('../../../services/companyService')

module.exports = {
    name: 'marketingempresa',
    aliases: ["cmd_marketingempresa","atalho_marketingempresa","abrev_marketingempresa"],
    category: 'economy',
    subcategory: 'Empresas',
    description: 'Investe em campanhas publicitárias para turbinar as vendas e margens',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const res = companyService.upgradeMarketing(sender)
        if (!res.success) return reply(res.message)

        let txt = '📢 *CAMPANHA DE MARKETING LANÇADA COM SUCESSO!*\n\n'
        txt += `⭐ *Novo Nível de Notoriedade:* Nível ${res.newMarketing} / 5\n`
        txt += `💰 *Custo Publicitário:* ${res.cost.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Restante:* ${res.remainingCoins.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Toda a sua produção recebeu +20% de bônus de lucro líquido!'
        return reply(txt.trim())
    }
}
