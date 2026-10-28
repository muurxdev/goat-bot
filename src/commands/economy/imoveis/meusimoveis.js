const realEstateService = require('../../../services/realEstateService')

module.exports = {
    name: 'meusimoveis',
    aliases: ["cmd_meusimoveis","atalho_meusimoveis","abrev_meusimoveis"],
    category: 'economy',
    subcategory: 'Imobiliária',
    description: 'Exibe sua carteira de propriedades imobiliárias e estado de conservação',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const list = realEstateService.getUserProperties(sender)
        if (list.length === 0) {
            return reply('🏡 *Você ainda não possui propriedades imobiliárias!*\n\nDigite `.imoveis` para consultar o catálogo e começar a construir seu patrimônio.')
        }

        let totalEquity = 0
        let totalRentDay = 0
        list.forEach(p => {
            totalEquity += p.purchase_price
            totalRentDay += p.rent_value
        })

        let txt = '╔════════ 🏰 *MINHA CARTEIRA IMOBILIÁRIA* ════════╗\n\n'
        txt += `🏛️ *Patrimônio Imobiliário Total:* ${totalEquity.toLocaleString('pt-BR')} moedas\n`
        txt += `💰 *Renda Passiva Potencial:* ${totalRentDay.toLocaleString('pt-BR')} moedas/dia\n`
        txt += `📦 *Total de Imóveis:* ${list.length} unidades\n\n`
        txt += '╭━〔 📋 SUAS PROPRIEDADES 〕━⬣\n'

        for (const p of list) {
            const condIcon = p.condition >= 80 ? '🟢' : p.condition >= 50 ? '🟡' : '🔴'
            txt += `┃ 🏰 *${p.name}* (${p.type})\n`
            txt += `┃    ├ Matrícula: ${p.id}\n`
            txt += `┃    ├ Aluguel Base: ${p.rent_value.toLocaleString('pt-BR')} moedas/dia\n`
            txt += `┃    └ ${condIcon} Conservação: ${p.condition}% | Seguro: ${p.insured ? '🛡️ Ativo' : '❌ Sem seguro'}\n`
        }
        txt += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
        txt += '💡 *Comandos Úteis:*\n'
        txt += '├ Recolher Renda: `.alugueis`\n'
        txt += '└ Reformar Imóvel: `.reformar <matrícula>`'
        return reply(txt.trim())
    }
}
