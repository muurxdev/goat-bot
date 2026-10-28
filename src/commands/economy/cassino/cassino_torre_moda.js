const economyService = require('../../../services/economyService')

module.exports = {
    name: 'cassino_torre_moda',
    aliases: ["cmd_cassino_torre_moda","atalho_cassino_torre_moda","abrev_cassino_torre_moda"],
    category: 'economy',
    subcategory: 'Jogos Regionais',
    description: 'Mesa de dados temática no cassino subterrâneo de torre',
    cooldownMs: 2500,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso: `.cassino_torre_moda <aposta>`')
        const user = economyService.carregarUsuario(sender)
        const valid = economyService.validarAposta({ user, texto: args[0] })
        if (!valid.ok) return reply(valid.erro)

        const d1 = Math.floor(Math.random() * 6) + 1
        const d2 = Math.floor(Math.random() * 6) + 1
        const total = d1 + d2
        const won = total >= 8
        const delta = won ? valid.valor : -valid.valor
        const res = await economyService.resolverAposta({ user, valor: valid.valor, delta })

        let txt = '╔═══════ 🎲 *CASSINO DE TORRE* ═══════╗\n\n'
        txt += `🎲 Dados Rolados: [${d1}] + [${d2}] = *${total} pts*\n`
        if (won) {
            txt += `🎉 Você venceu a mesa (pontuação >= 8)! +\n` + valid.valor.toLocaleString('pt-BR') + ' moedas\n'
        } else {
            txt += `💀 A banca venceu (pontuação < 8). -\n` + valid.valor.toLocaleString('pt-BR') + ' moedas\n'
        }
        txt += `🏦 *Saldo:* ${res.saldo.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
