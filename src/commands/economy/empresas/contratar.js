const companyService = require('../../../services/companyService')

module.exports = {
    name: 'contratar',
    aliases: ["cmd_contratar","atalho_contratar","abrev_contratar"],
    category: 'economy',
    subcategory: 'Empresas',
    description: 'Contrata funcionários para sua empresa acelerar a produção: .contratar [quantidade]',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        const count = parseInt(args[0], 10) || 1
        const res = companyService.hireEmployees(sender, count)
        if (!res.success) return reply(res.message)

        let txt = '👥 *NOVOS FUNCIONÁRIOS CONTRATADOS!*\n\n'
        txt += `➕ *Contratados:* ${res.hired} colaboradores\n`
        txt += `📊 *Equipe Total Atual:* ${res.totalEmployees} funcionários\n`
        txt += `💸 *Custo de Contratação:* ${res.totalCost.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Restante:* ${res.remainingCoins.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Sua produção por hora acabou de aumentar!'
        return reply(txt.trim())
    }
}
