/**
 * Comando .pescaouro — Pesca no lago dourado.
 *
 * Era um stub: escrevia o prêmio e não creditava nada. Agora o ganho é real e
 * o cooldown fica gravado no próprio usuário, então reiniciar o bot não
 * devolve a coleta de graça (como aconteceria com um Map em memória).
 */

const economy = require('../../services/economyService')

const COOLDOWN_MS = 1 * 60 * 60 * 1000

module.exports = {
    name: 'pescaouro',
    aliases: ["pescarouro","peixedourado","cmd_pescaouro","alt_pescaouro","atalho_pescaouro","abrev_pescaouro","call_pescaouro","func_pescaouro"],
    category: 'economy',
    subcategory: 'Coleta',
    description: 'Pesca no lago dourado',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const r = economy.coletar({
            sender,
            chave: 'pescaouro',
            cooldownMs: COOLDOWN_MS,
            min: 400,
            max: 2600,
            chanceVazio: 0.25
        })

        if (!r.ok) {
            return reply(
                '⏳ *PESCA DE OURO EM DESCANSO*\n\n' +
                `Volte em *${r.espera}*.\n\n` +
                `💰 _Saldo atual:_ ${economy.formatar(economy.saldo(r.user))} moedas`
            )
        }

        let doc = `🎣 *PESCA DE OURO*\n\n`
        doc += 'Você lança a linha no lago dourado...\n\n'

        if (r.vazio) {
            doc += '💀 *Só veio uma bota velha.*\n'
            doc += '💰 *Ganho:* 0 moedas\n'
        } else {
            doc += '🎉 *Fisgou um peixe dourado!*\n'
            doc += `💰 *Ganho:* +${economy.formatar(r.ganho)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n`
        doc += `⏱️ _Disponível de novo em 1h._`

        return reply(doc)
    }
}
