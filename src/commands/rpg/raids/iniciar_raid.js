const raidService = require('../../../services/raidService')

module.exports = {
    name: 'iniciar_raid',
    category: 'rpg',
    subcategory: 'Raids Comunitárias',
    description: 'Inicia uma Raid de chefe com múltiplas fases no grupo: .iniciar_raid [chefe]',
    cooldownMs: 5000,
    groupOnly: true,
    execute: async ({ from, reply, args }) => {
        const bossKey = args[0] || 'albion'
        const res = raidService.startRaid(from, bossKey)
        if (!res.success) return reply(res.message)

        let txt = '🔥 *UMA NOVA RAID COMUNITÁRIA COMEÇOU NO GRUPO!* 🔥\n\n'
        txt += `👹 *Chefe:* \${res.boss.name}\n`
        txt += `🏷️ *Título:* \${res.boss.title}\n`
        txt += `❤️ *Vida do Chefe:* \${res.boss.hpMax.toLocaleString('pt-BR')} HP (\${res.boss.phases} fases)\n`
        txt += `💰 *Recompensa Total:* \${res.boss.baseRewardCoins.toLocaleString('pt-BR')} moedas + \${res.boss.baseRewardXp.toLocaleString('pt-BR')} XP\n\n`
        txt += '⚔️ *COMO PARTICIPAR:*\n'
        txt += 'Todos os membros do grupo podem atacar com `.atacar_raid`.\n'
        txt += 'As recompensas serão distribuídas proporcionalmente ao dano causado!'
        return reply(txt.trim())
    }
}
