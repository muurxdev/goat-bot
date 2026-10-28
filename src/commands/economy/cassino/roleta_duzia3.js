const economyService = require('../../../services/economyService')

module.exports = {
    name: 'roleta_duzia3',
    aliases: ["cmd_roleta_duzia3","atalho_roleta_duzia3","abrev_roleta_duzia3"],
    category: 'economy',
    subcategory: 'Roleta Europeia',
    description: 'Aposta na modalidade Roleta: 3ª Dúzia (25-36) (Multiplicador 3x): .roleta_duzia3 <aposta>',
    cooldownMs: 2500,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.roleta_duzia3 <aposta>`\nExemplo: `.roleta_duzia3 50`')
        const user = economyService.carregarUsuario(sender)
        const valid = economyService.validarAposta({ user, texto: args[0] })
        if (!valid.ok) return reply(valid.erro)

        const rolledNumber = Math.floor(Math.random() * 37) // 0 a 36
        const won = (n => n >= 25 && n <= 36)(rolledNumber)
        const delta = won ? (valid.valor * 2) : -valid.valor
        const res = await economyService.resolverAposta({ user, valor: valid.valor, delta })

        const icon = won ? '🟢' : '🔴'
        let txt = `╔═══════ 🎡 *${icon} ROLETA: NÚMERO SORTEADO [${rolledNumber}]* ═══════╗\n\n`
        txt += '🎯 *Modalidade Apostada:* Roleta: 3ª Dúzia (25-36)\n'
        txt += `💰 *Valor da Aposta:* ${valid.valor.toLocaleString('pt-BR')} moedas\n`
        if (won) {
            txt += `🎉 *VOCÊ GANHOU!* Pagamento ${3}x: +${(valid.valor * 3).toLocaleString('pt-BR')} moedas\n`
        } else {
            txt += `💀 Não foi desta vez! Você perdeu ${valid.valor.toLocaleString('pt-BR')} moedas.\n`
        }
        txt += `🏦 *Saldo Atual:* ${res.saldo.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
