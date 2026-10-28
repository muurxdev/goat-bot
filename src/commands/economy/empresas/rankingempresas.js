const companyService = require('../../../services/companyService')

module.exports = {
    name: 'rankingempresas',
    aliases: ["cmd_rankingempresas","atalho_rankingempresas","abrev_rankingempresas"],
    category: 'economy',
    subcategory: 'Empresas',
    description: 'Ranking das maiores corporações e impérios do Reino de Reino',
    cooldownMs: 4000,
    execute: async ({ reply }) => {
        const list = companyService.getLeaderboard(10)
        if (list.length === 0) return reply('Ainda não existem corporações fundadas no Reino.')

        let txt = '╔════════ 👑 *MAIORES CORPORAÇÕES DO REINO* ════════╗\n\n'
        list.forEach((comp, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🔹'
            txt += `${medal} *${comp.name}* (Nível ${comp.level})\n`
            txt += `   └ Tipo: ${comp.type} | Funcionários: ${comp.employees} | Marketing: Nv.${comp.marketing}\n`
        })
        txt += '\n💡 Digite `.fundarempresa` para iniciar o seu império corporativo.'
        return reply(txt.trim())
    }
}
