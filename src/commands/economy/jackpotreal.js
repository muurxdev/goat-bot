/**
 * Comando .jackpotreal — Puxa a alavanca do jackpot real.
 *
 * Era um stub: anunciava prêmio e não mexia no saldo. Agora o bilhete é
 * debitado de verdade e o prêmio creditado.
 *
 * As faixas abaixo somam (chance x multiplicador) abaixo de 1 de propósito:
 * uma loteria que paga mais do que arrecada zera a economia do grupo em
 * poucas horas.
 */

const economy = require('../../services/economyService')

const BILHETE = 1000

// Ordenadas da mais rara para a mais comum; a primeira que casar vence.
const FAIXAS = [
    { chance: 0.0005, mult: 800, nome: 'JACKPOT!!!' },
    { chance: 0.004, mult: 120, nome: 'PRÊMIO MAIOR' },
    { chance: 0.03, mult: 18, nome: 'PRÊMIO MÉDIO' },
    { chance: 0.14, mult: 3, nome: 'PRÊMIO MENOR' }
]

module.exports = {
    name: 'jackpotreal',
    aliases: ["jackpot-real","potereal","cmd_jackpotreal","alt_jackpotreal","atalho_jackpotreal","abrev_jackpotreal","call_jackpotreal","func_jackpotreal"],
    category: 'economy',
    subcategory: 'Loteria',
    description: 'Puxa a alavanca do jackpot real',
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const user = economy.carregarUsuario(sender)
        const saldoAtual = economy.saldo(user)

        if (saldoAtual < BILHETE) {
            return reply(
                '🎰 *JACKPOT REAL*\n\n' +
                `❌ O bilhete custa 💰 *${economy.formatar(BILHETE)}* e você tem ${economy.formatar(saldoAtual)}.\n\n` +
                '💡 _Use_ `.trabalhar` _ou_ `.premiodiario` _para juntar._'
            )
        }

        const r = Math.random()
        const premiada = FAIXAS.find(f => r < f.chance)

        // Perder = só o bilhete. Ganhar = bilhete de volta + o prêmio.
        const delta = premiada ? BILHETE * (premiada.mult - 1) : -BILHETE
        const res = economy.aplicar(user, delta)

        let doc = `🎰 *JACKPOT REAL*\n\n`
        doc += `🎫 *Bilhete:* ${economy.formatar(BILHETE)} moedas\n\n`

        if (premiada) {
            doc += `🎉 *${premiada.nome}*\n`
            doc += `✖️ *Multiplicador:* ${premiada.mult}x\n`
            doc += `💰 *Você ganhou:* +${economy.formatar(res.delta)} moedas\n`
        } else {
            doc += '💀 *Bilhete não premiado.*\n'
            doc += `💸 *Perdeu:* ${economy.formatar(BILHETE)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(res.depois)} moedas`
        return reply(doc)
    }
}
