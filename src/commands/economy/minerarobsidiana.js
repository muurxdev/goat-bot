/**
 * Comando .minerarobsidiana — Extrai obsidiana perto da lava (rende mais, falha mais).
 *
 * Era um stub: escrevia o prêmio e não creditava nada. Agora o ganho é real e
 * o cooldown fica gravado no próprio usuário, então reiniciar o bot não
 * devolve a coleta de graça (como aconteceria com um Map em memória).
 */

const economy = require('../../services/economyService')

const COOLDOWN_MS = 3 * 60 * 60 * 1000

module.exports = {
    name: 'minerarobsidiana',
    aliases: ["obsidiana","minarobsidiana","cmd_minerarobsidiana","alt_minerarobsidiana","atalho_minerarobsidiana","abrev_minerarobsidiana","call_minerarobsidiana","func_minerarobsidiana"],
    category: 'economy',
    subcategory: 'Coleta',
    description: 'Extrai obsidiana perto da lava (rende mais, falha mais)',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const r = economy.coletar({
            sender,
            chave: 'minerarobsidiana',
            cooldownMs: COOLDOWN_MS,
            min: 1500,
            max: 7000,
            chanceVazio: 0.3
        })

        if (!r.ok) {
            return reply(
                '⏳ *VEIO DE OBSIDIANA EM DESCANSO*\n\n' +
                `Volte em *${r.espera}*.\n\n` +
                `💰 _Saldo atual:_ ${economy.formatar(economy.saldo(r.user))} moedas`
            )
        }

        let doc = `🖤 *VEIO DE OBSIDIANA*\n\n`
        doc += 'Você escava perto da lava...\n\n'

        if (r.vazio) {
            doc += '💀 *A picareta quebrou no basalto.*\n'
            doc += '💰 *Ganho:* 0 moedas\n'
        } else {
            doc += '🎉 *Bloco de obsidiana puro!*\n'
            doc += `💰 *Ganho:* +${economy.formatar(r.ganho)} moedas\n`
        }

        doc += `🏦 *Saldo atual:* ${economy.formatar(r.saldo)} moedas\n\n`
        doc += `⏱️ _Disponível de novo em 3h._`

        return reply(doc)
    }
}
