const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'imoveis',
    aliases: ["cmd_imoveis","atalho_imoveis","abrev_imoveis"],
    category: 'economy',
    subcategory: 'Imobiliária',
    description: 'Catálogo de propriedades e imóveis disponíveis para compra no Reino',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const list = realEstateService.getAllAvailableProperties()
        let txt = '╔════════ 🏰 *IMOBILIÁRIA REAL DE REINO* ════════╗\n\n'
        txt += 'Invista em patrimônio físico sólido e receba aluguéis diários passivos.\n\n'

        for (const p of list) {
            txt += `🏡 *${p.name}* (${p.type})\n`
            txt += `   ├ Preço de Aquisição: *${p.price.toLocaleString('pt-BR')} moedas*\n`
            txt += `   ├ Aluguel Diário: *${p.rentPerDay.toLocaleString('pt-BR')} moedas/dia*\n`
            txt += `   └ Código de Compra: \`.comprarimovel ${p.id}\`\n\n`
        }

        txt += '💡 Digite `.meusimoveis` para gerenciar seus imóveis e `.alugueis` para recolher sua renda passiva.'
        return reply(txt.trim())
    }
}
