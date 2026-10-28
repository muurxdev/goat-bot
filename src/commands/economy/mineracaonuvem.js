/**
 * Comando .mineracaonuvem — Aluga poder de processamento e minera enquanto você dorme.
 *
 * Era um stub: escrevia o prêmio e não creditava nada. Agora o ganho é real e
 * o cooldown fica gravado no próprio usuário, então reiniciar o bot não
 * devolve a coleta de graça (como aconteceria com um Map em memória).
 */

const economy = require('../../services/economyService')

const COOLDOWN_MS = 6 * 60 * 60 * 1000

module.exports = {
    name: 'mineracaonuvem',
    aliases: ["minerarnuvem","cloudmining","cmd_mineracaonuvem","alt_mineracaonuvem","atalho_mineracaonuvem","abrev_mineracaonuvem","call_mineracaonuvem","func_mineracaonuvem"],
    category: 'economy',
    subcategory: 'Coleta',
    description: 'Aluga poder de processamento e minera enquanto você dorme',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const r = economy.coletar({
            sender,
            chave: 'mineracaonuvem',
            cooldownMs: COOLDOWN_MS,
            min: 3000,
            max: 12000,
            chanceVazio: 0.1
        })

        if (!r.ok) {
            return reply(
                '⏳ *MINERAÇÃO EM NUVEM EM DESCANSO*\n\n' +
                `Volte em *${r.espera}*.\n\n` +
                `💰 _Saldo atual:_ ${economy.formatar(economy.saldo(r.user))} moedas`
            )
        }

        let doc = `☁️ *MINERAÇÃO EM NUVEM*\n\n`
        doc += 'Seus servidores processaram o ciclo...\n\n'

        if (r.vazio) {
            doc += '💀 *A conta de energia comeu o lucro.*\n'
            doc += '💰 *Ganho:* 0 moedas\n'
        } else {
            doc += '🎉 *Ciclo fechado com lucro!*\n'
            doc += `💰 *Ganho:* +${economy.formatar(r.ganho)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n`
        doc += `⏱️ _Disponível de novo em 6h._`

        return reply(doc)
    }
}
