/**
 * Comando .levelupdev — progressão do GRUPO DE CODIFICAÇÃO (Skycode).
 *
 * Mostra só o que é do mundo dev/grupo: XP e mensagens ganhas no grupo, comandos
 * usados, patente dev e o progresso para o próximo nível. Sem nada de RPG.
 */

const dataService = require('../../services/dataService')
const { initializeUser, getXpProgress } = require('../../services/xpService')
const { getCargo, getRank } = require('../../utils/helpers')
const ui = require('../../utils/ui')

module.exports = {
    name: 'levelupdev',
    aliases: ['leveldev', 'levelgrupo', 'xpdev', 'nivelgrupo'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Seu nível no grupo de codificação (XP de grupo, mensagens e patente dev)',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const prog = getXpProgress(user)
        const level = user.level || 1

        return reply(ui.screen({
            title: '👨‍💻 *NÍVEL DEV — GRUPO* 👨‍💻',
            intro: `🎖️ *Patente:* ${getCargo(level)}\n🏷️ *Rank:* ${getRank(level)}\n📈 *Nível:* ${level}`,
            sections: [
                {
                    title: 'Progresso', icon: '📊', lines: [
                        `${prog.barra} *${prog.percent}%*`,
                        `⭐ Faltam *${(prog.faltam || 0).toLocaleString('pt-BR')} XP* para o nível ${level + 1}`
                    ]
                },
                {
                    title: 'Atividade no grupo', icon: '💬', lines: [
                        `💬 Mensagens no grupo: *${(user.messagesGroup || 0).toLocaleString('pt-BR')}*`,
                        `⭐ XP ganho no grupo: *${(user.xpGroup || 0).toLocaleString('pt-BR')}*`,
                        `⌨️ Comandos usados no grupo: *${(user.commandsGroup || 0).toLocaleString('pt-BR')}*`,
                        `🪙 Coins do grupo: *${(user.coinsGroup || 0).toLocaleString('pt-BR')}*`
                    ]
                }
            ],
            hint: '_Áudio, figurinha, imagem e comandos também contam como mensagem._'
        }))
    }
}
