const economyService = require('../../../services/economyService')

module.exports = {
    name: 'roleta_par',
    aliases: ["cmd_roleta_par","atalho_roleta_par","abrev_roleta_par"],
    category: 'economy',
    subcategory: 'Roleta Europeia',
    description: 'Aposta na modalidade Roleta: Números Pares (Multiplicador 2x): .roleta_par <aposta>',
    cooldownMs: 2500,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.roleta_par <aposta>`\nExemplo: `.roleta_par 50`')
        const user = economyService.carregarUsuario(sender)
        const valid = economyService.validarAposta({ user, texto: args[0] })
        if (!valid.ok) return reply(valid.erro)

        const rolledNumber = Math.floor(Math.random() * 37) // 0 a 36
        const won = (n => n > 0 && n % 2 === 0)(rolledNumber)
        const delta = won ? (valid.valor * 1) : -valid.valor
        const res = await economyService.resolverAposta({ user, valor: valid.valor, delta })

        const icon = won ? '🟢' : '🔴'
        let txt = `╔═══════ 🎡 *${icon} ROLETA: NÚMERO SORTEADO [${rolledNumber}]* ═══════╗\n\n`
        txt += '🎯 *Modalidade Apostada:* Roleta: Números Pares\n'
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
