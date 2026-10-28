const companyService = require('../../../services/companyService')

module.exports = {
    name: 'auditoria_cafeteria',
    aliases: ["cmd_auditoria_cafeteria","atalho_auditoria_cafeteria","abrev_auditoria_cafeteria"],
    category: 'economy',
    subcategory: 'Auditoria Corporativa',
    description: 'Auditoria analítica e valuation do segmento de Cafeteria Encantada',
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const comp = companyService.getCompany(sender)
        if (!comp) return reply('Você precisa ter uma empresa fundada para executar uma auditoria.')

        let txt = '📑 *RELATÓRIO DE AUDITORIA CONTÁBIL INDEPENDENTE*\n\n'
        txt += `🏢 *Razão Social:* ${comp.name}\n`
        txt += `⭐ *Nível de Governança:* Nível ${comp.level} (${comp.level >= 5 ? 'Grau de Investimento AAA' : 'Em Consolidação'})\n`
        txt += `👥 *Força Produtiva:* ${comp.employees} profissionais ativos\n`
        txt += `💰 *Faturamento Anual Projetado:* ${(comp.netIncomePerHour * 24 * 365).toLocaleString('pt-BR')} moedas\n`
        txt += `🏷️ *Valuation de Mercado Estimado:* ${(comp.config.cost * comp.level * 2.2).toLocaleString('pt-BR')} moedas\n\n`
        txt += '✅ Situação fiscal e regulatória 100% aprovada pelo Ministério da Fazenda de Reino.'
        return reply(txt.trim())
    }
}
