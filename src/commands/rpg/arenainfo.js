const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { atualizarArenaPlayer } = require('../../services/rpgService')
const { arenas } = require('../../utils/constants')

module.exports = {
    name: 'arenainfo',
    aliases: ['minhaarena'],
    category: 'rpg',
    description: 'Exibe informações sobre sua arena atual e requisitos para a próxima',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        atualizarArenaPlayer(user)

        const arenaAtual = arenas[user.arenaAtual] || arenas[1]
        const proximaArena = Object.values(arenas).find(a => a.pontos > (user.arenaPontos || 0))

        const texto = '🏟️ *SUA ARENA ATUAL*\n\n' + arenaAtual.nome + '\n\n🏆 *Seus Troféus:* ' + (user.arenaPontos || 0) + '\n🔓 *Próxima Arena:* ' + (proximaArena ? (proximaArena.nome + ' (' + proximaArena.pontos + ' troféus)') : '👑 ARENA MÁXIMA ALCANÇADA!')
        await reply(texto)
    }
}