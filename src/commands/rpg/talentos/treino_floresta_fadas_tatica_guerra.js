const economyService = require('../../../services/economyService')

module.exports = {
    name: 'treino_floresta_fadas_tatica_guerra',
    category: 'rpg',
    subcategory: 'Campos de Treinamento',
    description: 'Sessão de treinamento marcial de tatica guerra no centro de treino de floresta_fadas',
    cooldownMs: 2500,
    execute: async ({ sender, reply }) => {
        const user = economyService.carregarUsuario(sender)
        const bonus = Math.floor(Math.random() * 150 + 80)
        user.xp = (user.xp || 0) + bonus
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('../../../services/dataService').saveUser(user)

        let txt = '🎯 *TREINAMENTO MARCIAL CONCLUÍDO!*\n\n'
        txt += '🏛️ *Campo Militar:* Guarnição de FLORESTA_FADAS\n'
        txt += '🥋 *Disciplina:* TATICA GUERRA\n'
        txt += `⚡ *Experiência de Combate:* +\${bonus} XP\n\n`
        txt += '💡 Treinos constantes preparam seu herói para as grandes raids!'
        return reply(txt.trim())
    }
}
