const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'alugueis',
    aliases: ["cmd_alugueis","atalho_alugueis","abrev_alugueis"],
    category: 'economy',
    subcategory: 'Imobiliária',
    description: 'Recolhe o rendimento de aluguéis passivos de todos os seus imóveis',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const res = realEstateService.collectRent(sender)
        if (!res.success) return reply(res.message)

        let txt = '🎉 *RENDIMENTOS DE ALUGUÉIS RECEBIDOS COM SUCESSO!*\n\n'
        txt += `🏡 *Imóveis Alugados:* ${res.collectedCount} propriedades\n`
        txt += `💰 *Total de Aluguel Recolhido:* +${res.totalRent.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Novo Saldo em Carteira:* ${res.newBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Os aluguéis continuam rendendo automaticamente para você todos os dias!'
        return reply(txt.trim())
    }
}
