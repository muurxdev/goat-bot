const bankingService = require('../../../services/bankingService')

module.exports = {
    name: 'cdb',
    aliases: ["cmd_cdb","atalho_cdb","abrev_cdb"],
    category: 'economy',
    subcategory: 'Renda Fixa',
    description: 'Menu de opções de investimentos em CDB com rentabilidade garantida',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔════════ 📈 *CDB & RENDA FIXA DE REINO* ════════╗\n\n'
        txt += 'Rendimento prefixado garantido pelo Tesouro Real. Sem risco de perda.\n\n'

        for (const [key, plan] of Object.entries(bankingService.CDB_PLANS)) {
            txt += `📜 *${plan.name}* (${key})\n`
            txt += `   ├ Prazo de Vencimento: *${plan.durationDays} dia(s)*\n`
            txt += `   ├ Rentabilidade Fixa: *+${(plan.yieldRate * 100).toFixed(1)}% no período*\n`
            txt += `   ├ Aporte Mínimo: *${plan.minAmount.toLocaleString('pt-BR')} moedas*\n`
            txt += `   └ Investir: \`.investircdb ${key} <valor>\`\n\n`
        }

        txt += '💡 Digite `.resgatarcdb` para recolher títulos que já venceram.'
        return reply(txt.trim())
    }
}
