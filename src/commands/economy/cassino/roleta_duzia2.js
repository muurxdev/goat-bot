const economyService = require('../../../services/economyService')

module.exports = {
    name: 'roleta_duzia2',
    aliases: ["cmd_roleta_duzia2","atalho_roleta_duzia2","abrev_roleta_duzia2"],
    category: 'economy',
    subcategory: 'Roleta Europeia',
    description: 'Aposta na modalidade Roleta: 2ª Dúzia (13-24) (Multiplicador 3x): .roleta_duzia2 <aposta>',
    cooldownMs: 2500,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.roleta_duzia2 <aposta>`\nExemplo: `.roleta_duzia2 50`')
        const user = economyService.carregarUsuario(sender)
        const valid = economyService.validarAposta({ user, texto: args[0] })
        if (!valid.ok) return reply(valid.erro)

        const rolledNumber = Math.floor(Math.random() * 37) // 0 a 36
        const won = (n => n >= 13 && n <= 24)(rolledNumber)
        const delta = won ? (valid.valor * 2) : -valid.valor
        const res = await economyService.resolverAposta({ user, valor: valid.valor, delta })

        const icon = won ? '🟢' : '🔴'
        let txt = `╔═══════ 🎡 *${icon} ROLETA: NÚMERO SORTEADO [${rolledNumber}]* ═══════╗\n\n`
        txt += '🎯 *Modalidade Apostada:* Roleta: 2ª Dúzia (13-24)\n'
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
