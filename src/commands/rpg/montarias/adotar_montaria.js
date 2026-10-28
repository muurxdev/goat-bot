const mountService = require('../../../services/mountService')

module.exports = {
    name: 'adotar_montaria',
    aliases: [],
    category: 'rpg',
    subcategory: 'Montarias',
    description: 'Adota uma montaria para seu estábulo pessoal: .adotar_montaria <id>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.adotar_montaria <id da montaria>`\nExemplo: `.adotar_montaria guardiao_porco`\nDigite `.estabulo` para ver as opções.')
        const res = mountService.adoptMount(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '🎉 *PARABÉNS! NOVA MONTARIA ADOTADA!*\n\n'
        txt += `🐴 *Mascote:* \${res.name}\n`
        txt += `💰 *Custo:* \${res.cost.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Restante:* \${res.newBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Sua montaria já foi equipada como montaria principal e está pronta para cavalgar!'
        return reply(txt.trim())
    }
}
