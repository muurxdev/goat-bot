/**
 * Comando .recompensaespiao — Entrega informações e recebe por fora.
 *
 * Era um stub: escrevia o prêmio e não creditava nada. Agora o ganho é real e
 * o cooldown fica gravado no próprio usuário, então reiniciar o bot não
 * devolve a coleta de graça (como aconteceria com um Map em memória).
 */

const economy = require('../../services/economyService')

const COOLDOWN_MS = 6 * 60 * 60 * 1000

module.exports = {
    name: 'recompensaespiao',
    aliases: ["espiao","recompensaspy","cmd_recompensaespiao","alt_recompensaespiao","atalho_recompensaespiao","abrev_recompensaespiao","call_recompensaespiao","func_recompensaespiao"],
    category: 'economy',
    subcategory: 'Coleta',
    description: 'Entrega informações e recebe por fora',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const r = economy.coletar({
            sender,
            chave: 'recompensaespiao',
            cooldownMs: COOLDOWN_MS,
            min: 1800,
            max: 8500,
            chanceVazio: 0.28
        })

        if (!r.ok) {
            return reply(
                '⏳ *RECOMPENSA DO ESPIÃO EM DESCANSO*\n\n' +
                `Volte em *${r.espera}*.\n\n` +
                `💰 _Saldo atual:_ ${economy.formatar(economy.saldo(r.user))} moedas`
            )
        }

        let doc = `🕵️ *RECOMPENSA DO ESPIÃO*\n\n`
        doc += 'Você entrega o dossiê no ponto combinado...\n\n'

        if (r.vazio) {
            doc += '💀 *O contato não apareceu.*\n'
            doc += '💰 *Ganho:* 0 moedas\n'
        } else {
            doc += '🎉 *Pagamento recebido em mãos.*\n'
            doc += `💰 *Ganho:* +${economy.formatar(r.ganho)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n`
        doc += `⏱️ _Disponível de novo em 6h._`

        return reply(doc)
    }
}
