const economyService = require('../../../services/economyService')

module.exports = {
    name: 'treino_central_defesa_escudo',
    category: 'rpg',
    subcategory: 'Campos de Treinamento',
    description: 'Sessão de treinamento marcial de defesa escudo no centro de treino de central',
    cooldownMs: 2500,
    execute: async ({ sender, reply }) => {
        const user = economyService.carregarUsuario(sender)
        const bonus = Math.floor(Math.random() * 150 + 80)
        user.xp = (user.xp || 0) + bonus
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('../../../services/dataService').saveUser(user)

        let txt = '🎯 *TREINAMENTO MARCIAL CONCLUÍDO!*\n\n'
        txt += '🏛️ *Campo Militar:* Guarnição de CENTRAL\n'
        txt += '🥋 *Disciplina:* DEFESA ESCUDO\n'
        txt += `⚡ *Experiência de Combate:* +\${bonus} XP\n\n`
        txt += '💡 Treinos constantes preparam seu herói para as grandes raids!'
        return reply(txt.trim())
    }
}
