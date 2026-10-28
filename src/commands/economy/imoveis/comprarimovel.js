const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'comprarimovel',
    aliases: ["cmd_comprarimovel","atalho_comprarimovel","abrev_comprarimovel"],
    category: 'economy',
    subcategory: 'Imobiliária',
    description: 'Adquire a escritura de uma propriedade imobiliária: .comprarimovel <código>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.comprarimovel <código>`\nExemplo: `.comprarimovel kitnet` ou `.comprarimovel apartamento`\nDigite `.imoveis` para ver as opções.')
        const res = realEstateService.buyProperty(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '🎉 *PARABÉNS! ESCRITURA LAVRADA NO CARTÓRIO REAL!*\n\n'
        txt += `📜 *Matrícula do Imóvel:* ${res.dbId}\n`
        txt += `🏰 *Propriedade:* ${res.property.name}\n`
        txt += `🏷️ *Tipo:* ${res.property.type}\n`
        txt += `💰 *Valor Pago:* ${res.property.price.toLocaleString('pt-BR')} moedas\n`
        txt += `💵 *Aluguel Passivo Gerado:* ${res.property.rentPerDay.toLocaleString('pt-BR')} moedas/dia\n`
        txt += `🏦 *Saldo Restante em Carteira:* ${res.newBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Inquilinos já foram alocados! Você começará a receber aluguéis a partir de hoje (`.alugueis`).'
        return reply(txt.trim())
    }
}
