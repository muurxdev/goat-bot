/**
 * Comando .loteriasaga — Compra um bilhete da Loteria SAGA.
 *
 * Era um stub: anunciava prêmio e não mexia no saldo. Agora o bilhete é
 * debitado de verdade e o prêmio creditado.
 *
 * As faixas abaixo somam (chance x multiplicador) abaixo de 1 de propósito:
 * uma loteria que paga mais do que arrecada zera a economia do grupo em
 * poucas horas.
 */

const economy = require('../../services/economyService')

const BILHETE = 500

// Ordenadas da mais rara para a mais comum; a primeira que casar vence.
const FAIXAS = [
    { chance: 0.0001, mult: 500, nome: 'MEGA ACUMULADA' },
    { chance: 0.002, mult: 80, nome: 'QUADRA' },
    { chance: 0.02, mult: 12, nome: 'TERNO' },
    { chance: 0.1, mult: 3, nome: 'DUQUE' }
]

module.exports = {
    name: 'loteriasaga',
    aliases: ["lotosaga","loteriadaily","cmd_loteriasaga","alt_loteriasaga","atalho_loteriasaga","abrev_loteriasaga","call_loteriasaga","func_loteriasaga"],
    category: 'economy',
    subcategory: 'Loteria',
    description: 'Compra um bilhete da Loteria SAGA',
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const user = economy.carregarUsuario(sender)
        const saldoAtual = economy.saldo(user)

        if (saldoAtual < BILHETE) {
            return reply(
                '🎟️ *LOTERIA SAGA*\n\n' +
                `❌ O bilhete custa 💰 *${economy.formatar(BILHETE)}* e você tem ${economy.formatar(saldoAtual)}.\n\n` +
                '💡 _Use_ `.trabalhar` _ou_ `.premiodiario` _para juntar._'
            )
        }

        const r = Math.random()
        const premiada = FAIXAS.find(f => r < f.chance)

        // Perder = só o bilhete. Ganhar = bilhete de volta + o prêmio.
        const delta = premiada ? BILHETE * (premiada.mult - 1) : -BILHETE
        const res = economy.aplicar(user, delta)

        let doc = `🎟️ *LOTERIA SAGA*\n\n`
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
