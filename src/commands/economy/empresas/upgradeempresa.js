const companyService = require('../../../services/companyService')

module.exports = {
    name: 'upgradeempresa',
    aliases: ["cmd_upgradeempresa","atalho_upgradeempresa","abrev_upgradeempresa"],
    category: 'economy',
    subcategory: 'Empresas',
    description: 'Expande a infraestrutura da empresa e aumenta a capacidade máxima',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const res = companyService.upgradeCompany(sender)
        if (!res.success) return reply(res.message)

        let txt = '⭐ *MODERNIZAÇÃO CONCLUÍDA COM SUCESSO!*\n\n'
        txt += `🏢 *Empresa:* ${res.companyName}\n`
        txt += `🚀 *Novo Nível:* Nível ${res.newLevel}\n`
        txt += `💰 *Investimento Realizado:* ${res.upgradeCost.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Restante:* ${res.remainingCoins.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 O teto de funcionários e a receita base por hora aumentaram significativamente!'
        return reply(txt.trim())
    }
}
