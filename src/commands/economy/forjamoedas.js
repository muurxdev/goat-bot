/**
 * Comando .forjamoedas — Funde metal bruto em moedas na forja.
 *
 * Era um stub: escrevia o prêmio e não creditava nada. Agora o ganho é real e
 * o cooldown fica gravado no próprio usuário, então reiniciar o bot não
 * devolve a coleta de graça (como aconteceria com um Map em memória).
 */

const economy = require('../../services/economyService')

const COOLDOWN_MS = 5 * 60 * 60 * 1000

module.exports = {
    name: 'forjamoedas',
    aliases: ["forjarmoedas","forjamoeda","cmd_forjamoedas","alt_forjamoedas","atalho_forjamoedas","abrev_forjamoedas","call_forjamoedas","func_forjamoedas"],
    category: 'economy',
    subcategory: 'Coleta',
    description: 'Funde metal bruto em moedas na forja',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const r = economy.coletar({
            sender,
            chave: 'forjamoedas',
            cooldownMs: COOLDOWN_MS,
            min: 2000,
            max: 9000,
            chanceVazio: 0.18
        })

        if (!r.ok) {
            return reply(
                '⏳ *FORJA DE MOEDAS EM DESCANSO*\n\n' +
                `Volte em *${r.espera}*.\n\n` +
                `💰 _Saldo atual:_ ${economy.formatar(economy.saldo(r.user))} moedas`
            )
        }

        let doc = `⚒️ *FORJA DE MOEDAS*\n\n`
        doc += 'Você aquece a forja e bate o martelo...\n\n'

        if (r.vazio) {
            doc += '💀 *O metal trincou ao esfriar.*\n'
            doc += '💰 *Ganho:* 0 moedas\n'
        } else {
            doc += '🎉 *Moedas cunhadas com sucesso!*\n'
            doc += `💰 *Ganho:* +${economy.formatar(r.ganho)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n`
        doc += `⏱️ _Disponível de novo em 5h._`

        return reply(doc)
    }
}
