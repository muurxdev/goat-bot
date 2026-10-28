const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

module.exports = {
    name: 'rep',
    aliases: ['reputacao', 'reputar'],
    category: 'profile',
    description: 'Dá +1 ponto de reputação para outro usuário',
    execute: async ({ info, sender, reply }) => {
        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid
        if (!mentioned || mentioned.length === 0) {
            return reply('❌ Marque alguém para dar reputação. Exemplo: .rep @usuario')
        }

        const alvo = mentioned[0]
        if (alvo === sender) {
            return reply('❌ Você não pode dar reputação para si mesmo.')
        }

        const xpData = dataService.getXpData()
        const perfilAlvo = initializeUser(alvo, xpData)

        perfilAlvo.rep = (perfilAlvo.rep || 0) + 1
        await dataService.saveXpData(xpData)
        logger.info('[REP] User ' + sender + ' deu +1 reputação para ' + alvo)

        await reply('❤️ @' + alvo.split('@')[0] + ' recebeu +1 ponto de reputação! (Total: ' + perfilAlvo.rep + ')', [alvo])
    }
}