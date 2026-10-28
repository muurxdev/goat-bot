const raidService = require('../../../services/raidService')

module.exports = {
    name: 'status_raid',
    category: 'rpg',
    subcategory: 'Raids Comunitárias',
    description: 'Consulta o status atual, HP e líderes de dano da Raid do grupo',
    cooldownMs: 3000,
    groupOnly: true,
    execute: async ({ from, reply }) => {
        const raid = raidService.getActiveRaid(from)
        if (!raid) return reply('Nenhuma Raid ativa no grupo no momento. Use `.iniciar_raid`.')

        const hpBar = Math.round((raid.hp_current / raid.hp_max) * 10)
        const barVisual = '█'.repeat(hpBar) + '░'.repeat(10 - hpBar)

        let txt = `╔════════ 🔥 *STATUS DA RAID ATIVA* 🔥 ════════╗\n\n`
        txt += `👹 *Chefe:* \${raid.boss_name}\n`
        txt += `❤️ *HP do Chefe:* [\${barVisual}] \${raid.hp_current.toLocaleString('pt-BR')} / \${raid.hp_max.toLocaleString('pt-BR')} HP\n`
        txt += `⭐ *Fase Atual:* Fase \${raid.phase}\n\n`
        txt += '╭━〔 ⚔️ TOP HERÓIS PARTICIPANTES 〕━⬣\n'
        raid.participants.sort((a, b) => b.damage - a.damage).slice(0, 5).forEach((p, idx) => {
            txt += `┃ \${idx + 1}º *\${p.name}:* \${p.damage.toLocaleString('pt-BR')} de dano (\${p.turns} turnos)\n`
        })
        txt += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
        txt += 'Para lutar: `.atacar_raid`'
        return reply(txt.trim())
    }
}
