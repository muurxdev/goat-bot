const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { arenas, cartasArena } = require('../../utils/constants')

module.exports = {
    name: 'cartas',
    aliases: ['cards', 'guardioes'],
    category: 'rpg',
    description: 'Lista as cartas e guardiões de uma determinada arena (.cartas [numero])',
    execute: async ({ text, sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const arenaNum = Number(text) || user.arenaAtual || 1
        if (!arenas[arenaNum]) {
            return reply('❌ Arena inválida. As arenas vão do número 1 ao 20.')
        }

        const cartas = cartasArena[arenaNum] || []

        const texto = '🃏 *CARTAS E GUARDIÕES DA ARENA*\n\n' + arenas[arenaNum].nome + '\n\n' + cartas.map(c => '• ' + c).join('\n') + '\n\nPara consultar outra arena:\n*.cartas [1-20]*'
        await reply(texto)
    }
}