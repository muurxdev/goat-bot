/**
 * Comando .leveluprpg — progressão do RPG (farm, combate e vida).
 *
 * Mostra só o lado RPG: HP real (atual/máximo), atributos de combate, rebirth e
 * o progresso de nível. O HP usa a FONTE ÚNICA (characterEngine.resolveHp), então
 * bate com o que aparece no boneco e no dossiê.
 */

const dataService = require('../../services/dataService')
const { initializeUser, getXpProgress } = require('../../services/xpService')
const { calculateFullCharacterStats, getRebirthInfo, resolveHp } = require('../../services/characterEngine')
const ui = require('../../utils/ui')

module.exports = {
    name: 'leveluprpg',
    aliases: ['levelrpg', 'xprpg', 'nivelrpg', 'statusrpgnivel'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Seu nível de RPG — vida real, atributos de combate, rebirth e farm',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (user.rpgEnabled === false) {
            return reply('⚔️ *RPG desativado no seu perfil.*\n\n🎮 Ative com `.login rpg on` para ver seu nível de RPG.')
        }

        const prog = getXpProgress(user)
        const stats = calculateFullCharacterStats(user)
        const hp = resolveHp(user)
        const rb = getRebirthInfo(user)
        const level = user.level || 1

        return reply(ui.screen({
            title: '⚔️ *NÍVEL RPG* ⚔️',
            intro: `📈 *Nível:* ${level}  ·  ⚡ *Poder (CP):* ${stats.cp.toLocaleString('pt-BR')}\n🌀 *Rebirths:* ${rb.rebirths}/${rb.maxRebirths} (+${rb.bonusDmgPercent}% dano/XP)`,
            sections: [
                {
                    title: 'Vida', icon: '❤️', lines: [
                        `*${hp.atual.toLocaleString('pt-BR')} / ${hp.max.toLocaleString('pt-BR')} HP* (${hp.percent}%)`,
                        hp.barra
                    ]
                },
                {
                    title: 'Combate', icon: '🗡️', lines: [
                        `⚔️ Ataque: *${stats.atk.toLocaleString('pt-BR')}*`,
                        `🛡️ Defesa: *${stats.def.toLocaleString('pt-BR')}*`,
                        `🎯 Crítico: *${stats.crit}%* · 💨 Esquiva: *${stats.esq}%* · 🛡️ Bloqueio: *${stats.bloq}%*`
                    ]
                },
                {
                    title: 'Progresso & farm', icon: '📊', lines: [
                        `${prog.barra} *${prog.percent}%*`,
                        `⭐ Faltam *${(prog.faltam || 0).toLocaleString('pt-BR')} XP* para o nível ${level + 1}`,
                        `🏆 Vitórias: *${user.wins || 0}* · ☠️ Derrotas: *${user.losses || 0}*`,
                        `🐉 Bosses derrotados: *${user.bossesMortos || 0}*`
                    ]
                }
            ],
            hint: '_A vida cai conforme você toma dano e volta ao máximo ao subir de nível._'
        }))
    }
}
