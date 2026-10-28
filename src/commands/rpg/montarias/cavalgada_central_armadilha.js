const mountService = require('../../../services/mountService')
const economyService = require('../../../services/economyService')

module.exports = {
    name: 'cavalgada_central_armadilha',
    aliases: [],
    category: 'rpg',
    subcategory: 'Rotas de Montaria',
    description: 'Cavalgada de exploração em central utilizando técnica de armadilha',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const mounts = mountService.getUserMounts(sender)
        const eqMount = mounts.find(m => m.equipped)
        const mountName = eqMount ? eqMount.name : 'A pé (sem montaria)'
        const bonusSpeed = eqMount ? Math.round(eqMount.speed_bonus * 100) : 0

        const user = economyService.carregarUsuario(sender)
        const coinsFound = Math.floor(Math.random() * 180 + 80) * (eqMount ? 1.5 : 1)
        user.coins = (user.coins || 0) + Math.floor(coinsFound)
        economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('../../../services/dataService').saveUser(user)

        let txt = '🐎 *CAVALGADA PELA ROTA CENTRAL!*\n\n'
        txt += `🐴 *Montaria Utilizada:* \${mountName} (Bônus de Velocidade: +\${bonusSpeed}%)\n`
        txt += `💰 *Moedas Encontradas na Estrada:* +\${Math.floor(coinsFound)} moedas\n`
        txt += `👛 *Novo Saldo:* \${user.coins.toLocaleString('pt-BR')} moedas`
        return reply(txt.trim())
    }
}
