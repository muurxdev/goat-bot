/**
 * Comando .roletadasorte — Gira a roleta da sorte por um prêmio.
 *
 * Era um stub: anunciava prêmio e não mexia no saldo. Agora o bilhete é
 * debitado de verdade e o prêmio creditado.
 *
 * As faixas abaixo somam (chance x multiplicador) abaixo de 1 de propósito:
 * uma loteria que paga mais do que arrecada zera a economia do grupo em
 * poucas horas.
 */

const economy = require('../../services/economyService')

const BILHETE = 300

// Ordenadas da mais rara para a mais comum; a primeira que casar vence.
const FAIXAS = [
    { chance: 0.001, mult: 300, nome: 'PRÊMIO MÁXIMO' },
    { chance: 0.01, mult: 40, nome: 'PRÊMIO ALTO' },
    { chance: 0.06, mult: 8, nome: 'PRÊMIO BOM' },
    { chance: 0.25, mult: 2, nome: 'PRÊMIO PEQUENO' }
]

module.exports = {
    name: 'roletadasorte',
    aliases: ["rodadasorte","girosorte","cmd_roletadasorte","alt_roletadasorte","atalho_roletadasorte","abrev_roletadasorte","call_roletadasorte","func_roletadasorte"],
    category: 'economy',
    subcategory: 'Loteria',
    description: 'Gira a roleta da sorte por um prêmio',
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const user = economy.carregarUsuario(sender)
        const saldoAtual = economy.saldo(user)

        if (saldoAtual < BILHETE) {
            return reply(
                '🎡 *ROLETA DA SORTE*\n\n' +
                `❌ O bilhete custa 💰 *${economy.formatar(BILHETE)}* e você tem ${economy.formatar(saldoAtual)}.\n\n` +
                '💡 _Use_ `.trabalhar` _ou_ `.premiodiario` _para juntar._'
            )
        }

        const r = Math.random()
        const premiada = FAIXAS.find(f => r < f.chance)

        // Perder = só o bilhete. Ganhar = bilhete de volta + o prêmio.
        const delta = premiada ? BILHETE * (premiada.mult - 1) : -BILHETE
        const res = economy.aplicar(user, delta)

        let doc = `🎡 *ROLETA DA SORTE*\n\n`
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
