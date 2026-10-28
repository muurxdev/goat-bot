/**
 * Comando .resgatepremio — Resgata o prêmio diário garantido (1 vez por dia).
 *
 * Era um stub: escrevia o prêmio e não creditava nada. Agora o ganho é real e
 * o cooldown fica gravado no próprio usuário, então reiniciar o bot não
 * devolve a coleta de graça (como aconteceria com um Map em memória).
 */

const economy = require('../../services/economyService')

const COOLDOWN_MS = 24 * 60 * 60 * 1000

module.exports = {
    name: 'resgatepremio',
    aliases: ["resgateprem","premioresgate","cmd_resgatepremio","alt_resgatepremio","atalho_resgatepremio","abrev_resgatepremio","call_resgatepremio","func_resgatepremio"],
    category: 'economy',
    subcategory: 'Coleta',
    description: 'Resgata o prêmio diário garantido (1 vez por dia)',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const r = economy.coletar({
            sender,
            chave: 'resgatepremio',
            cooldownMs: COOLDOWN_MS,
            min: 8000,
            max: 30000,
            chanceVazio: 0
        })

        if (!r.ok) {
            return reply(
                '⏳ *RESGATE DE PRÊMIO EM DESCANSO*\n\n' +
                `Volte em *${r.espera}*.\n\n` +
                `💰 _Saldo atual:_ ${economy.formatar(economy.saldo(r.user))} moedas`
            )
        }

        let doc = `🎫 *RESGATE DE PRÊMIO*\n\n`
        doc += 'Você apresenta o cupom no balcão...\n\n'

        if (r.vazio) {
            doc += '💀 *Nada encontrado.*\n'
            doc += '💰 *Ganho:* 0 moedas\n'
        } else {
            doc += '🎉 *Prêmio liberado!*\n'
            doc += `💰 *Ganho:* +${economy.formatar(r.ganho)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n`
        doc += `⏱️ _Disponível de novo em 24h._`

        return reply(doc)
    }
}
