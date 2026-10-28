/**
 * Comando .minerardiamante — Minera diamantes na caverna profunda.
 *
 * Era um stub: escrevia o prêmio e não creditava nada. Agora o ganho é real e
 * o cooldown fica gravado no próprio usuário, então reiniciar o bot não
 * devolve a coleta de graça (como aconteceria com um Map em memória).
 */

const economy = require('../../services/economyService')

const COOLDOWN_MS = 2 * 60 * 60 * 1000

module.exports = {
    name: 'minerardiamante',
    aliases: ["diamante","minardiamante","cmd_minerardiamante","alt_minerardiamante","atalho_minerardiamante","abrev_minerardiamante","call_minerardiamante","func_minerardiamante"],
    category: 'economy',
    subcategory: 'Coleta',
    description: 'Minera diamantes na caverna profunda',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const r = economy.coletar({
            sender,
            chave: 'minerardiamante',
            cooldownMs: COOLDOWN_MS,
            min: 800,
            max: 4500,
            chanceVazio: 0.2
        })

        if (!r.ok) {
            return reply(
                '⏳ *MINA DE DIAMANTES EM DESCANSO*\n\n' +
                `Volte em *${r.espera}*.\n\n` +
                `💰 _Saldo atual:_ ${economy.formatar(economy.saldo(r.user))} moedas`
            )
        }

        let doc = `💎 *MINA DE DIAMANTES*\n\n`
        doc += 'Você desce na mina com a picareta...\n\n'

        if (r.vazio) {
            doc += '💀 *Só pedra bruta. A veia secou.*\n'
            doc += '💰 *Ganho:* 0 moedas\n'
        } else {
            doc += '🎉 *Veio de diamante!*\n'
            doc += `💰 *Ganho:* +${economy.formatar(r.ganho)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n`
        doc += `⏱️ _Disponível de novo em 2h._`

        return reply(doc)
    }
}
