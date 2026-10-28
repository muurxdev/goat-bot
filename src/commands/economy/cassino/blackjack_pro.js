const blackjackService = require('../../../services/blackjackService')

module.exports = {
    name: 'blackjack_pro',
    aliases: ["cmd_blackjack_pro","atalho_blackjack_pro","abrev_blackjack_pro"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Inicia uma rodada de Blackjack Pro (21) contra a banca da Taberna: .blackjack_pro <aposta>',
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        if (!args[0]) return reply('Uso correto: `.blackjack_pro <aposta>`\nExemplo: `.blackjack_pro 100`')
        const bet = parseInt(args[0], 10)
        const res = blackjackService.startGame(sender, bet)
        if (res.success === false) return reply(res.message)

        if (res.finished) {
            let txt = '🃏 *BLACKJACK NATURAL (21 NA PRIMEIRA MÃO)!*\n\n'
            txt += `👤 *Suas Cartas:* ${blackjackService.formatHand(res.playerHand)} (${res.playerScore} pts)\n`
            txt += `🎩 *Cartas do Dealer:* ${blackjackService.formatHand(res.dealerHand)} (${res.dealerScore} pts)\n\n`
            txt += `🎉 Você venceu com pagamento 3:2!\n`
            txt += `💰 *Prêmio Recebido:* +${res.payout.toLocaleString('pt-BR')} moedas\n`
            txt += `🏦 *Novo Saldo:* ${res.newBalance.toLocaleString('pt-BR')} moedas`
            return reply(txt.trim())
        }

        let txt = '╔════════ 🃏 *MESA DE BLACKJACK (21)* ════════╗\n\n'
        txt += `👤 *Suas Cartas:* ${blackjackService.formatHand(res.playerHand)} (*${res.playerScore} pts*)\n`
        txt += `🎩 *Carta Visível do Dealer:* ${blackjackService.formatHand(res.dealerHand, true)}\n`
        txt += `💰 *Aposta na Mesa:* ${res.bet.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 *Sua Vez! Escolha uma ação:*\n'
        txt += '├ Digite `.bj_hit` para pedir outra carta\n'
        txt += '└ Digite `.bj_stand` para parar com a mão atual'
        return reply(txt.trim())
    }
}
