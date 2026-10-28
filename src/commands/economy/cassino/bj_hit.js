const blackjackService = require('../../../services/blackjackService')

module.exports = {
    name: 'bj_hit',
    aliases: ["cmd_bj_hit","atalho_bj_hit","abrev_bj_hit"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Pede uma carta adicional na sua rodada ativa de Blackjack',
    cooldownMs: 1500,
    execute: async ({ sender, reply }) => {
        const res = blackjackService.hit(sender)
        if (res.success === false) return reply(res.message)

        if (res.finished) {
            let txt = '💥 *ESTOUROU! BUST (MAIS DE 21 PONTOS)*\n\n'
            txt += `👤 *Suas Cartas:* ${blackjackService.formatHand(res.playerHand)} (*${res.playerScore} pts*)\n`
            txt += `🎩 *Mesa da Banca:* ${blackjackService.formatHand(res.dealerHand)} (*${res.dealerScore} pts*)\n`
            txt += `💀 Você perdeu sua aposta de ${res.bet.toLocaleString('pt-BR')} moedas.\n`
            txt += `🏦 *Saldo Atual:* ${res.newBalance.toLocaleString('pt-BR')} moedas`
            return reply(txt.trim())
        }

        let txt = '🃏 *CARTA COMPRADA!*\n\n'
        txt += `👤 *Suas Cartas:* ${blackjackService.formatHand(res.playerHand)} (*${res.playerScore} pts*)\n`
        txt += `💰 *Aposta:* ${res.bet.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 Digite `.bj_hit` para pedir outra ou `.bj_stand` para parar.'
        return reply(txt.trim())
    }
}
