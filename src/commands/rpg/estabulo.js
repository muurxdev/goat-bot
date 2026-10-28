const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const logger = require('../../core/logger')

const MOUNTS = {
    cavalo: { nome: '🐴 Cavalo de Guerra', bonus: '+20% loot em batalhas', effect: 'loot', value: 0.2 },
    grifo: { nome: '🦅 Grifo', bonus: '+30% chance de fuga', effect: 'fuga', value: 0.3 },
    phoenix: { nome: '🔥 Fênix', bonus: 'Revive 1x por dia', effect: 'revive', value: 1 },
    lobo: { nome: '🐺 Lobo Alfa', bonus: '+15% dano em ataque', effect: 'ataque', value: 0.15 }
}

module.exports = {
    name: 'estabulo',
    aliases: ['mounts', 'estabulomontaria'],
    category: 'rpg',
    subcategory: 'Exploração',
    description: 'Sistema de montarias — compre, equipe e gerencie mounts',
    cooldownMs: 10000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const sub = (args[0] || '').toLowerCase()

        if (!sub || sub === 'lista' || sub === 'disponiveis') {
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🐎 *ESTÁBULO REAL* 🐎   ║\n'
            doc += '╚══════════════════════════════╝\n\n'

            const equipped = user.mount ? (typeof user.mount === 'object' ? user.mount.name : user.mount) : null

            if (equipped) {
                const mData = MOUNTS[equipped] || {}
                doc += `📌 *Montaria Equipada:* ${mData.nome || equipped}\n`
                doc += `✨ *Bônus:* ${mData.bonus || 'N/A'}\n\n`
            }

            doc += '╭━〔 🐾 MONTARIAS DISPONÍVEIS 〕━⬣\n'
            Object.entries(MOUNTS).forEach(([key, m]) => {
                const owned = (user.mounts || []).includes(key)
                doc += `┃ ${m.nome} (${key})\n`
                doc += `┃ ✨ *Bônus:* ${m.bonus}\n`
                doc += `┃ 📦 *Status:* ${owned ? '✅ Possuído' : '🔒 Não possui'}\n`
                doc += `┃ ─────────────────\n`
            })
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            doc += '💡 _Use_ \`.estabulo montar <nome>\` _para equipar uma montaria!_'

            return reply(doc.trim(), [sender])
        }

        if (sub === 'montar' || sub === 'equipar' || sub === 'usar') {
            const mountName = (args[1] || '').toLowerCase()

            if (!mountName || !MOUNTS[mountName]) {
                return reply('❌ Montaria inválida! Disponíveis: cavalo, grifo, phoenix, lobo\nEx: `.estabulo montar cavalo`')
            }

            if (!(user.mounts || []).includes(mountName)) {
                return reply(`❌ Você não possui a montaria *${MOUNTS[mountName].nome}*!\n💡 _Obtinha montarias em eventos e raids!_`)
            }

            user.mount = { name: mountName, type: mountName, level: 1 }

            await dataService.saveXpData(xpData)
            logger.info(`[ESTABULO] ${sender} montou ${mountName}`)

            const mData = MOUNTS[mountName]
            return reply(`✅ *MONTARIA EQUIPADA!*\n\n${mData.nome}\n✨ *Bônus Ativo:* ${mData.bonus}`, [sender])
        }

        if (sub === 'ver' || sub === 'info') {
            const equipped = user.mount ? (typeof user.mount === 'object' ? user.mount : { name: user.mount }) : null
            const owned = user.mounts || []

            if (!equipped && owned.length === 0) {
                return reply('🐴 *Você não possui nenhuma montaria!*\n\n💡 _Obtinha montarias em eventos e raids!_')
            }

            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🐎 *SUAS MONTARIAS* 🐎   ║\n'
            doc += '╚══════════════════════════════╝\n\n'

            if (equipped) {
                const mData = MOUNTS[equipped.name] || MOUNTS[equipped.type] || {}
                doc += `╭━〔 🏆 MONTARIA EQUIPADA 〕━⬣\n`
                doc += `┃ ${mData.nome || equipped.name}\n`
                doc += `┃ ✨ *Bônus:* ${mData.bonus || 'N/A'}\n`
                doc += `┃ 📈 *Nível:* ${equipped.level || 1}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            }

            doc += `╭━〔 🎒 MONTARIAS POSSEÍDAS (${owned.length}) 〕━⬣\n`
            owned.forEach(m => {
                const mData = MOUNTS[m] || {}
                const isEquipped = equipped && (equipped.name === m || equipped.name === m.name)
                doc += `┃ ${mData.nome || m} ${isEquipped ? '✅ *(Equipada)*' : ''}\n`
            })
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            doc += '💡 _Montar:_ \`.estabulo montar <nome>\`'

            return reply(doc.trim(), [sender])
        }

        return reply('❌ Opção inválida! Use:\n• `.estabulo` — Ver montarias disponíveis\n• `.estabulo montar <nome>` — Equipar montaria\n• `.estabulo ver` — Ver suas montarias')
    }
}
