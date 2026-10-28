/**
 * Comando .leveluppv — nível COMPLETO (engloba tudo).
 *
 * Junta os três lados: atividade no grupo (dev), atividade no privado e o RPG
 * (vida real, combate). É a visão total do progresso da pessoa.
 */

const dataService = require('../../services/dataService')
const { initializeUser, getXpProgress } = require('../../services/xpService')
const { calculateFullCharacterStats, resolveHp } = require('../../services/characterEngine')
const { getCargo, getRank } = require('../../utils/helpers')
const ui = require('../../utils/ui')

module.exports = {
    name: 'leveluppv',
    aliases: ['levelpv', 'nivelcompleto', 'levelcompleto', 'nivelpv'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Seu nível completo: grupo, privado e RPG num só painel',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const prog = getXpProgress(user)
        const level = user.level || 1
        const hp = resolveHp(user)
        const stats = calculateFullCharacterStats(user)

        const totalMsgs = (user.messagesGroup || 0) + (user.messagesPv || 0) || (user.messages || 0)
        const totalCmds = (user.commandsGroup || 0) + (user.commandsPv || 0)
        const rpgOn = user.rpgEnabled !== false

        const sections = [
            {
                title: 'Progresso geral', icon: '📊', lines: [
                    `${prog.barra} *${prog.percent}%*`,
                    `⭐ XP total: *${(user.xp || 0).toLocaleString('pt-BR')}*`,
                    `⭐ Faltam *${(prog.faltam || 0).toLocaleString('pt-BR')} XP* para o nível ${level + 1}`
                ]
            },
            {
                title: 'Grupo (dev)', icon: '👨‍💻', lines: [
                    `💬 Mensagens: *${(user.messagesGroup || 0).toLocaleString('pt-BR')}*`,
                    `⭐ XP: *${(user.xpGroup || 0).toLocaleString('pt-BR')}* · ⌨️ Comandos: *${(user.commandsGroup || 0).toLocaleString('pt-BR')}*`
                ]
            },
            {
                title: 'Privado (PV)', icon: '💬', lines: [
                    `💬 Mensagens: *${(user.messagesPv || 0).toLocaleString('pt-BR')}*`,
                    `⭐ XP: *${(user.xpPv || 0).toLocaleString('pt-BR')}* · ⌨️ Comandos: *${(user.commandsPv || 0).toLocaleString('pt-BR')}*`
                ]
            }
        ]

        if (rpgOn) {
            sections.push({
                title: 'RPG', icon: '⚔️', lines: [
                    `❤️ Vida: *${hp.atual.toLocaleString('pt-BR')} / ${hp.max.toLocaleString('pt-BR')}* (${hp.percent}%)`,
                    hp.barra,
                    `⚡ Poder (CP): *${stats.cp.toLocaleString('pt-BR')}* · ⚔️ ATK *${stats.atk.toLocaleString('pt-BR')}* · 🛡️ DEF *${stats.def.toLocaleString('pt-BR')}*`
                ]
            })
        }

        return reply(ui.screen({
            title: '🏆 *NÍVEL COMPLETO* 🏆',
            intro: `🎖️ *Patente:* ${getCargo(level)} · 🏷️ ${getRank(level)}\n📈 *Nível:* ${level}  ·  💬 *Mensagens:* ${totalMsgs.toLocaleString('pt-BR')}  ·  ⌨️ *Comandos:* ${totalCmds.toLocaleString('pt-BR')}\n🪙 *Coins:* ${(user.coins || 0).toLocaleString('pt-BR')}${rpgOn ? '' : '\n⚔️ _RPG desativado no seu perfil (.login rpg on)_'}`,
            sections,
            hint: '_Veja separado:_ `.levelupdev` _(grupo)_ · `.leveluprpg` _(RPG)_'
        }))
    }
}
