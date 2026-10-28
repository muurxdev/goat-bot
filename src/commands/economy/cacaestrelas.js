/**
 * Comando .cacaestrelas — Caça estrelas cadentes no céu noturno.
 *
 * Era um stub: escrevia o prêmio e não creditava nada. Agora o ganho é real e
 * o cooldown fica gravado no próprio usuário, então reiniciar o bot não
 * devolve a coleta de graça (como aconteceria com um Map em memória).
 */

const economy = require('../../services/economyService')

const COOLDOWN_MS = 3 * 60 * 60 * 1000

module.exports = {
    name: 'cacaestrelas',
    aliases: ["estrelas","cacarestrelas","cmd_cacaestrelas","alt_cacaestrelas","atalho_cacaestrelas","abrev_cacaestrelas","call_cacaestrelas","func_cacaestrelas"],
    category: 'economy',
    subcategory: 'Coleta',
    description: 'Caça estrelas cadentes no céu noturno',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const r = economy.coletar({
            sender,
            chave: 'cacaestrelas',
            cooldownMs: COOLDOWN_MS,
            min: 900,
            max: 6000,
            chanceVazio: 0.22
        })

        if (!r.ok) {
            return reply(
                '⏳ *CAÇA ÀS ESTRELAS EM DESCANSO*\n\n' +
                `Volte em *${r.espera}*.\n\n` +
                `💰 _Saldo atual:_ ${economy.formatar(economy.saldo(r.user))} moedas`
            )
        }

        let doc = `⭐ *CAÇA ÀS ESTRELAS*\n\n`
        doc += 'Você mira o telescópio no céu...\n\n'

        if (r.vazio) {
            doc += '💀 *Céu nublado. Nada hoje.*\n'
            doc += '💰 *Ganho:* 0 moedas\n'
        } else {
            doc += '🎉 *Estrela cadente capturada!*\n'
            doc += `💰 *Ganho:* +${economy.formatar(r.ganho)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n`
        doc += `⏱️ _Disponível de novo em 3h._`

        return reply(doc)
    }
}
