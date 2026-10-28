const economyService = require('../../../services/economyService')

module.exports = {
    name: 'roleta_vermelho',
    aliases: ["cmd_roleta_vermelho","atalho_roleta_vermelho","abrev_roleta_vermelho"],
    category: 'economy',
    subcategory: 'Roleta Europeia',
    description: 'Aposta na modalidade Roleta: Cor Vermelha (Multiplicador 2x): .roleta_vermelho <aposta>',
    cooldownMs: 2500,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.roleta_vermelho <aposta>`\nExemplo: `.roleta_vermelho 50`')
        const user = economyService.carregarUsuario(sender)
        const valid = economyService.validarAposta({ user, texto: args[0] })
        if (!valid.ok) return reply(valid.erro)

        const rolledNumber = Math.floor(Math.random() * 37) // 0 a 36
        const won = (n => [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(n))(rolledNumber)
        const delta = won ? (valid.valor * 1) : -valid.valor
        const res = await economyService.resolverAposta({ user, valor: valid.valor, delta })

        const icon = won ? '🟢' : '🔴'
        let txt = `╔═══════ 🎡 *${icon} ROLETA: NÚMERO SORTEADO [${rolledNumber}]* ═══════╗\n\n`
        txt += '🎯 *Modalidade Apostada:* Roleta: Cor Vermelha\n'
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
