/**
 * Comando .baupremiado — Abre o baú premiado do dia.
 *
 * Era um stub: escrevia o prêmio e não creditava nada. Agora o ganho é real e
 * o cooldown fica gravado no próprio usuário, então reiniciar o bot não
 * devolve a coleta de graça (como aconteceria com um Map em memória).
 */

const economy = require('../../services/economyService')

const COOLDOWN_MS = 8 * 60 * 60 * 1000

module.exports = {
    name: 'baupremiado',
    aliases: ["baudopremio","baugift","cmd_baupremiado","alt_baupremiado","atalho_baupremiado","abrev_baupremiado","call_baupremiado","func_baupremiado"],
    category: 'economy',
    subcategory: 'Coleta',
    description: 'Abre o baú premiado do dia',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const r = economy.coletar({
            sender,
            chave: 'baupremiado',
            cooldownMs: COOLDOWN_MS,
            min: 2500,
            max: 14000,
            chanceVazio: 0.2
        })

        if (!r.ok) {
            return reply(
                '⏳ *BAÚ PREMIADO EM DESCANSO*\n\n' +
                `Volte em *${r.espera}*.\n\n` +
                `💰 _Saldo atual:_ ${economy.formatar(economy.saldo(r.user))} moedas`
            )
        }

        let doc = `🎁 *BAÚ PREMIADO*\n\n`
        doc += 'Você arromba o cadeado enferrujado...\n\n'

        if (r.vazio) {
            doc += '💀 *Armadilha! O baú era isca.*\n'
            doc += '💰 *Ganho:* 0 moedas\n'
        } else {
            doc += '🎉 *Prêmio garantido!*\n'
            doc += `💰 *Ganho:* +${economy.formatar(r.ganho)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n`
        doc += `⏱️ _Disponível de novo em 8h._`

        return reply(doc)
    }
}
