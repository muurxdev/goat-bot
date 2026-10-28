const blackjackService = require('../../../services/blackjackService')

module.exports = {
    name: 'bj_stand',
    aliases: ["cmd_bj_stand","atalho_bj_stand","abrev_bj_stand"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Para sua mão e passa a vez para o dealer no Blackjack',
    cooldownMs: 1500,
    execute: async ({ sender, reply }) => {
        const res = blackjackService.stand(sender)
        if (res.success === false) return reply(res.message)

        let outcomeText = ''
        if (res.outcome === 'DEALER_BUST') {
            outcomeText = '🎉 *DEALER ESTOUROU (MAIS DE 21)! VOCÊ VENCEU!*'
        } else if (res.outcome === 'PLAYER_WINS') {
            outcomeText = '🎉 *SUA PONTUAÇÃO SUPEROU A BANCA! VOCÊ VENCEU!*'
        } else if (res.outcome === 'PUSH') {
            outcomeText = '🤝 *EMPATE (PUSH)! SUA APOSTA FOI DEVOLVIDA INTEGRALMENTE.*'
        } else {
            outcomeText = '💀 *O DEALER FEZ UMA PONTUAÇÃO MAIOR. A BANCA VENCEU.*'
        }

        let txt = `${outcomeText}\n\n`
        txt += `👤 *Sua Mão Final:* ${blackjackService.formatHand(res.playerHand)} (*${res.playerScore} pts*)\n`
        txt += `🎩 *Mão Final do Dealer:* ${blackjackService.formatHand(res.dealerHand)} (*${res.dealerScore} pts*)\n\n`
        txt += `💰 *Aposta:* ${res.bet.toLocaleString('pt-BR')} moedas\n`
        if (res.payout > 0) {
            txt += `💸 *Recebido:* +${res.payout.toLocaleString('pt-BR')} moedas\n`
        }
        txt += `🏦 *Novo Saldo:* ${res.newBalance.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
