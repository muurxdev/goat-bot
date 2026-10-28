const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'reformar',
    aliases: ["cmd_reformar","atalho_reformar","abrev_reformar"],
    category: 'economy',
    subcategory: 'Imobiliária',
    description: 'Restaura a condição de um imóvel para 100%: .reformar <matrícula>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.reformar <matrícula>`\nConsulte as matrículas dos seus imóveis com `.meusimoveis`.')
        const res = realEstateService.renovateProperty(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '🛠️ *REFORMA E RESTAURAÇÃO CONCLUÍDA!*\n\n'
        txt += `🏰 *Propriedade:* ${res.propertyName}\n`
        txt += '⭐ *Estado de Conservação Atual:* 100% (Novo em Folha)\n'
        txt += `💰 *Custo da Reforma:* ${res.cost.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Restante:* ${res.newBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Com conservação máxima, seus inquilinos pagam 100% do aluguel sem descontos!'
        return reply(txt.trim())
    }
}
