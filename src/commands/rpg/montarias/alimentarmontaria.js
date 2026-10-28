const mountService = require('../../../services/mountService')

module.exports = {
    name: 'alimentarmontaria',
    aliases: [],
    category: 'rpg',
    subcategory: 'Montarias',
    description: 'Alimenta sua montaria com ração especial para recuperar energia e subir nível: .alimentarmontaria <id>',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.alimentarmontaria <id da montaria>`\nConsulte os IDs no seu estábulo com `.minhasmontarias`.')
        const res = mountService.feedMount(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '🍎 *MONTARIA ALIMENTADA COM SUCESSO!*\n\n'
        txt += `🐴 *Montaria:* \${res.mountName}\n`
        txt += `⭐ *Novo Nível:* Nível \${res.newLevel}\n`
        txt += '⚡ *Energia:* 100% (Vigor Máximo)\n'
        txt += `💰 *Custo:* \${res.cost} moedas\n`
        txt += `🏦 *Saldo Restante:* \${res.newBalance.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
