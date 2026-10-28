const companyService = require('../../../services/companyService')

module.exports = {
    name: 'minhaempresa',
    aliases: ["cmd_minhaempresa","atalho_minhaempresa","abrev_minhaempresa"],
    category: 'economy',
    subcategory: 'Empresas',
    description: 'Abre o painel corporativo da sua empresa com métricas de lucro e funcionários',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const comp = companyService.getCompany(sender)
        if (!comp) {
            return reply('🏢 *Você ainda não possui uma empresa!*\n\nDigite `.fundarempresa` para ver os ramos de negócios disponíveis e começar a lucrar.')
        }

        let txt = `╔═══════ 🏢 *${comp.name.toUpperCase()}* ═══════╗\n\n`
        txt += `🏷️ *Ramo:* ${comp.config.name}\n`
        txt += `⭐ *Nível da Empresa:* Nível ${comp.level} / 10\n`
        txt += `👥 *Funcionários:* ${comp.employees} / ${comp.config.maxEmployees * comp.level}\n`
        txt += `📢 *Marketing:* Nível ${comp.marketing} / 5\n\n`
        txt += '╭━〔 📊 DESEMPENHO FINANCEIRO 〕━⬣\n'
        txt += `┃ 💰 *Receita Bruta:* +${comp.grossIncomePerHour.toLocaleString('pt-BR')} moedas/hora\n`
        txt += `┃ 💸 *Custo Folha de Pagamento:* -${comp.empCostPerHour.toLocaleString('pt-BR')} moedas/hora\n`
        txt += `┃ 📈 *Lucro Líquido:* +${comp.netIncomePerHour.toLocaleString('pt-BR')} moedas/hora\n`
        txt += `┃ ⏳ *Tempo Produzindo:* ${comp.elapsedHours} horas\n`
        txt += `┃ 💵 *Lucro Acumulado no Caixa:* ${comp.pendingProfit.toLocaleString('pt-BR')} moedas\n`
        txt += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
        txt += '💡 *Ações Disponíveis:*\n'
        txt += '├ Recolher Lucro: `.coletarlucro`\n'
        txt += '├ Contratar: `.contratar [quantidade]`\n'
        txt += '├ Evoluir Nível: `.upgradeempresa`\n'
        txt += '└ Marketing: `.marketingempresa`'
        return reply(txt.trim())
    }
}
