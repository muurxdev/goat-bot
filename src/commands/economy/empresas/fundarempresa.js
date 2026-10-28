const companyService = require('../../../services/companyService')

module.exports = {
    name: 'fundarempresa',
    aliases: ["cmd_fundarempresa","atalho_fundarempresa","abrev_fundarempresa"],
    category: 'economy',
    subcategory: 'Empresas',
    description: 'Funda uma nova empresa no Reino: .fundarempresa <tipo> <nome da empresa>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0] || !args[1]) {
            let help = '🏢 *FUNDAÇÃO DE EMPRESAS NO REINO DE REINO*\n\n'
            help += 'Uso: `.fundarempresa <tipo> <nome da sua empresa>`\n\n'
            help += '╭━〔 📋 TIPOS DE EMPRESAS DISPONÍVEIS 〕━⬣\n'
            for (const [key, t] of Object.entries(companyService.COMPANY_TYPES)) {
                help += `┃ 🔹 *${key}:* ${t.name}\n`
                help += `┃    └ Custo: ${t.cost.toLocaleString('pt-BR')} moedas | Receita: ${t.baseIncomePerHour}/h\n`
            }
            help += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            help += 'Exemplo: `.fundarempresa agencia Camisa 10 Sports`'
            return reply(help.trim())
        }

        const type = args[0]
        const name = args.slice(1).join(' ')
        const res = companyService.createCompany(sender, name, type)
        if (!res.success) return reply(res.message)

        let txt = '🎉 *PARABÉNS! SUA EMPRESA FOI REGISTRADA COM SUCESSO!*\n\n'
        txt += `📜 *Registro:* ${res.companyId}\n`
        txt += `🏢 *Razão Social:* ${res.name}\n`
        txt += `🏷️ *Setor:* ${res.type}\n`
        txt += `💰 *Investimento Inicial:* ${res.cost.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Restante:* ${res.remainingCoins.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Digite `.minhaempresa` para abrir o painel corporativo.'
        return reply(txt.trim())
    }
}
