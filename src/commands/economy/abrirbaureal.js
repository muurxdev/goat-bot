/**
 * Comando .abrirbaureal — Abre o baú do tesouro real (1 vez a cada 12h).
 *
 * Era um stub: escrevia o prêmio e não creditava nada. Agora o ganho é real e
 * o cooldown fica gravado no próprio usuário, então reiniciar o bot não
 * devolve a coleta de graça (como aconteceria com um Map em memória).
 */

const economy = require('../../services/economyService')

const COOLDOWN_MS = 12 * 60 * 60 * 1000

module.exports = {
    name: 'abrirbaureal',
    aliases: ["baureal","baudorei","cmd_abrirbaureal","alt_abrirbaureal","atalho_abrirbaureal","abrev_abrirbaureal","call_abrirbaureal","func_abrirbaureal"],
    category: 'economy',
    subcategory: 'Coleta',
    description: 'Abre o baú do tesouro real (1 vez a cada 12h)',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const r = economy.coletar({
            sender,
            chave: 'abrirbaureal',
            cooldownMs: COOLDOWN_MS,
            min: 5000,
            max: 25000,
            chanceVazio: 0.12
        })

        if (!r.ok) {
            return reply(
                '⏳ *BAÚ REAL EM DESCANSO*\n\n' +
                `Volte em *${r.espera}*.\n\n` +
                `💰 _Saldo atual:_ ${economy.formatar(economy.saldo(r.user))} moedas`
            )
        }

        let doc = `🗝️ *BAÚ REAL*\n\n`
        doc += 'Você gira a chave dourada...\n\n'

        if (r.vazio) {
            doc += '💀 *O baú estava vazio. Alguém chegou antes.*\n'
            doc += '💰 *Ganho:* 0 moedas\n'
        } else {
            doc += '🎉 *O baú estava cheio!*\n'
            doc += `💰 *Ganho:* +${economy.formatar(r.ganho)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n`
        doc += `⏱️ _Disponível de novo em 12h._`

        return reply(doc)
    }
}
