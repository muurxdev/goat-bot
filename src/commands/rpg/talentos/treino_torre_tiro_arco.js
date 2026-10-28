const economyService = require('../../../services/economyService')

module.exports = {
    name: 'treino_torre_tiro_arco',
    category: 'rpg',
    subcategory: 'Campos de Treinamento',
    description: 'Sessão de treinamento marcial de tiro arco no centro de treino de torre',
    cooldownMs: 2500,
    execute: async ({ sender, reply }) => {
        const user = economyService.carregarUsuario(sender)
        const bonus = Math.floor(Math.random() * 150 + 80)
        user.xp = (user.xp || 0) + bonus
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('../../../services/dataService').saveUser(user)

        let txt = '🎯 *TREINAMENTO MARCIAL CONCLUÍDO!*\n\n'
        txt += '🏛️ *Campo Militar:* Guarnição de TORRE\n'
        txt += '🥋 *Disciplina:* TIRO ARCO\n'
        txt += `⚡ *Experiência de Combate:* +\${bonus} XP\n\n`
        txt += '💡 Treinos constantes preparam seu herói para as grandes raids!'
        return reply(txt.trim())
    }
}
