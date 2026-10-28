const raidService = require('../../../services/raidService')

module.exports = {
    name: 'atacar_raid',
    category: 'rpg',
    subcategory: 'Raids Comunitárias',
    description: 'Desfere um ataque de combate contra o chefe da Raid ativa no grupo',
    cooldownMs: 2000,
    groupOnly: true,
    execute: async ({ from, sender, reply }) => {
        const res = raidService.attackRaid(from, sender)
        if (res.success === false) return reply(res.message)

        if (res.finished) {
            let txt = '🎉 *O CHEFE DA RAID FOI DERROTADO! VITÓRIA DO GRUPO!* 🏆\n\n'
            txt += `👹 *Chefe Vencido:* \${res.bossName}\n`
            txt += `👥 *Heróis Participantes:* \${res.totalParticipants} guerreiros\n\n`
            txt += '╭━〔 🎖️ TOP RECOMPENSAS POR DANO 〕━⬣\n'
            res.rewards.sort((a, b) => b.damage - a.damage).slice(0, 10).forEach((r, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🔹'
                txt += `┃ \${medal} *\${r.name}:* \${r.damage.toLocaleString('pt-BR')} dano\n`
                txt += `┃    └ Recompensa: +\${r.coins.toLocaleString('pt-BR')} moedas | +\${r.xp.toLocaleString('pt-BR')} XP\n`
            })
            txt += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            txt += '✨ Os prêmios já foram depositados diretamente nas contas dos participantes!'
            return reply(txt.trim())
        }

        const critText = res.isCrit ? '💥 *GOLPE CRÍTICO!* ' : '⚔️ '
        const hpBar = Math.round((res.remainingHp / res.maxHp) * 10)
        const barVisual = '█'.repeat(hpBar) + '░'.repeat(10 - hpBar)

        let txt = `\${critText}Você causou *\${res.damage.toLocaleString('pt-BR')} de dano* em \${res.bossName}!\n\n`
        txt += `❤️ *Vida Restante:* [\${barVisual}] \${res.remainingHp.toLocaleString('pt-BR')} / \${res.maxHp.toLocaleString('pt-BR')} HP\n`
        txt += `⭐ *Fase do Chefe:* Fase \${res.currentPhase} / \${res.totalPhases}\n`
        txt += `⚠️ *Contra-Ataque do Chefe:* *\${res.bossAttack}*!\n\n`
        txt += '💡 Ataque novamente com `.atacar_raid` para subir no ranking de dano!'
        return reply(txt.trim())
    }
}
