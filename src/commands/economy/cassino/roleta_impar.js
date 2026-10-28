const economyService = require('../../../services/economyService')

module.exports = {
    name: 'roleta_impar',
    aliases: ["cmd_roleta_impar","atalho_roleta_impar","abrev_roleta_impar"],
    category: 'economy',
    subcategory: 'Roleta Europeia',
    description: 'Aposta na modalidade Roleta: Números Ímpares (Multiplicador 2x): .roleta_impar <aposta>',
    cooldownMs: 2500,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.roleta_impar <aposta>`\nExemplo: `.roleta_impar 50`')
        const user = economyService.carregarUsuario(sender)
        const valid = economyService.validarAposta({ user, texto: args[0] })
        if (!valid.ok) return reply(valid.erro)

        const rolledNumber = Math.floor(Math.random() * 37) // 0 a 36
        const won = (n => n % 2 !== 0)(rolledNumber)
        const delta = won ? (valid.valor * 1) : -valid.valor
        const res = await economyService.resolverAposta({ user, valor: valid.valor, delta })

        const icon = won ? '🟢' : '🔴'
        let txt = `╔═══════ 🎡 *${icon} ROLETA: NÚMERO SORTEADO [${rolledNumber}]* ═══════╗\n\n`
        txt += '🎯 *Modalidade Apostada:* Roleta: Números Ímpares\n'
        txt += `💰 *Valor da Aposta:* ${valid.valor.toLocaleString('pt-BR')} moedas\n`
        if (won) {
            txt += `🎉 *VOCÊ GANHOU!* Pagamento ${2}x: +${(valid.valor * 2).toLocaleString('pt-BR')} moedas\n`
        } else {
            txt += `💀 Não foi desta vez! Você perdeu ${valid.valor.toLocaleString('pt-BR')} moedas.\n`
        }
        txt += `🏦 *Saldo Atual:* ${res.saldo.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
