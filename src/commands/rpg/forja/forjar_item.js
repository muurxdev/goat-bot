const craftService = require('../../../services/craftService')

module.exports = {
    name: 'forjar_item',
    aliases: [],
    category: 'rpg',
    subcategory: 'Forja & Alquimia',
    description: 'Forja uma arma ou destila uma poção pelo ID da receita: .forjar_item <id>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.forjar_item <id da receita>`\nExemplo: `.forjar_item forja_espada_central`\nDigite `.receitas` para ver as opções.')
        const res = craftService.craftItem(sender, args[0])
        if (!res.success) return reply(res.message)

        let txt = '⚒️ *FORJA CONCLUÍDA COM MAESTRIA!*\n\n'
        txt += `✨ *Item Criado:* \${res.resultItem}\n`
        txt += `💰 *Custo dos Materiais:* \${res.cost.toLocaleString('pt-BR')} moedas\n`
        txt += `🏦 *Saldo Restante:* \${res.newBalance.toLocaleString('pt-BR')} moedas\n\n`
        txt += '🎒 O item foi adicionado diretamente à sua mochila de aventureiro (`.mochila`).'
        return reply(txt.trim())
    }
}
