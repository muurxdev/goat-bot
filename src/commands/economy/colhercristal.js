/**
 * Comando .colhercristal — Colhe cristais mágicos no jardim suspenso.
 *
 * Era um stub: escrevia o prêmio e não creditava nada. Agora o ganho é real e
 * o cooldown fica gravado no próprio usuário, então reiniciar o bot não
 * devolve a coleta de graça (como aconteceria com um Map em memória).
 */

const economy = require('../../services/economyService')

const COOLDOWN_MS = 4 * 60 * 60 * 1000

module.exports = {
    name: 'colhercristal',
    aliases: ["cristal","colhercristais","cmd_colhercristal","alt_colhercristal","atalho_colhercristal","abrev_colhercristal","call_colhercristal","func_colhercristal"],
    category: 'economy',
    subcategory: 'Coleta',
    description: 'Colhe cristais mágicos no jardim suspenso',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const r = economy.coletar({
            sender,
            chave: 'colhercristal',
            cooldownMs: COOLDOWN_MS,
            min: 1200,
            max: 5500,
            chanceVazio: 0.15
        })

        if (!r.ok) {
            return reply(
                '⏳ *JARDIM DE CRISTAIS EM DESCANSO*\n\n' +
                `Volte em *${r.espera}*.\n\n` +
                `💰 _Saldo atual:_ ${economy.formatar(economy.saldo(r.user))} moedas`
            )
        }

        let doc = `🔮 *JARDIM DE CRISTAIS*\n\n`
        doc += 'Você colhe os cristais maduros...\n\n'

        if (r.vazio) {
            doc += '💀 *Todos os cristais racharam.*\n'
            doc += '💰 *Ganho:* 0 moedas\n'
        } else {
            doc += '🎉 *Cristais de alta pureza!*\n'
            doc += `💰 *Ganho:* +${economy.formatar(r.ganho)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n`
        doc += `⏱️ _Disponível de novo em 4h._`

        return reply(doc)
    }
}
